#!/usr/bin/env python3
"""
shai_hulud_scan.py — Scanner de IOCs do worm Mini Shai-Hulud (TeamPCP, campanha "Dune").

NÃO-DESTRUTIVO. Apenas lê. Nunca revoga token, nunca apaga arquivo, nunca mata processo.
Stdlib pura (Python 3.8+). Roda em Linux e macOS.

Uso:
    python3 shai_hulud_scan.py                 # escaneia $HOME e o diretório atual
    python3 shai_hulud_scan.py /srv /opt ~/dev # escaneia caminhos específicos
    python3 shai_hulud_scan.py --json          # saída em JSON pra pipeline

Cobre: lockfiles npm/pnpm/yarn, router_init.js (com checagem de hash), optionalDependencies
@tanstack/setup, persistência (.claude / .vscode / systemd / LaunchAgents), domínios C2,
workflow codeql_analysis.yml malicioso, token npm com descrição-resgate, e pacotes PyPI
comprometidos (mistralai 2.4.6, guardrails-ai 0.10.1).

AVISO CRÍTICO: se for achado um token npm com a descrição
"IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner", NÃO REVOGUE.
Isole e faça imagem forense da máquina primeiro — a revogação dispara wipe destrutivo.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# ----------------------------------------------------------------------------
# IOCs (fonte: StepSecurity, 2026-05-11 / atualização 2026-06-09)
# ----------------------------------------------------------------------------

KNOWN_HASHES = {
    "ab4fcadaec49c03278063dd269ea5eef82d24f2124a8e15d7b90f2fa8601266c": "router_init.js (payload @tanstack)",
    "2ec78d556d696e208927cc503d48e4b5eb56b31abc2870c2ed2e98d6be27fc96": "tanstack_runner.js (payload do fork)",
    "7c12d8614c624c70d6dd6fc2ee289332474abaa38f70ebe2cdef064923ca3a9b": "@tanstack/setup package.json",
}

C2_DOMAINS = [
    "api.masscan.cloud",
    "filev2.getsession.org",
    "git-tanstack.com",
    "seed1.getsession.org",
]

RANSOM_TOKEN_DESC = "IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner"

MALICIOUS_OPTDEP_MARKER = "@tanstack/setup"
MALICIOUS_GITHUB_COMMIT = "79ac49eedf774dd4b0cfa308722bc463cfe5885c"
DEAD_DROP_AUTHOR = "claude@users.noreply.github.com"
DEAD_DROP_MSG = "chore: update dependencies"
DUNE_BRANCH_RE = re.compile(r"dependabot/github_actions/format/")

# Artefatos de persistência relativos à raiz de um repo
REPO_PERSISTENCE = [
    ".claude/router_runtime.js",
    ".claude/setup.mjs",
    ".vscode/setup.mjs",
]
REPO_SUSPICIOUS = {
    ".claude/settings.json": ("SessionStart", "setup.mjs"),       # hook que re-executa o malware
    ".vscode/tasks.json": ("folderOpen", "setup.mjs"),            # task que dispara ao abrir a pasta
    ".github/workflows/codeql_analysis.yml": ("toJSON(secrets)", None),  # exfil de todos os secrets
}

# Persistência a nível de SO (no $HOME do usuário)
OS_PERSISTENCE = [
    "Library/LaunchAgents/com.user.gh-token-monitor.plist",
    ".config/systemd/user/gh-token-monitor.service",
    ".local/bin/gh-token-monitor.sh",
    ".config/gh-token-monitor",
]

# Arquivos onde os domínios C2 / segredos podem ter vazado em texto
GREP_TARGETS = [
    ".bash_history", ".zsh_history", ".python_history",
    ".npmrc", ".pypirc", ".netrc",
]

# ----------------------------------------------------------------------------
# Pacotes npm comprometidos: nome -> set de versões
# (3.8.0 do opensearch incluído por ter sido a versão usada na análise dinâmica)
# ----------------------------------------------------------------------------
NPM_BAD = {
    "@mistralai/mistralai": {"2.2.3", "2.2.4"},
    "@mistralai/mistralai-azure": {"1.7.2", "1.7.3"},
    "@mistralai/mistralai-gcp": {"1.7.2", "1.7.3"},
    "@opensearch-project/opensearch": {"3.6.2", "3.8.0"},
    "@tanstack/router-utils": {"1.161.11", "1.161.14"},
    "@tanstack/router-core": {"1.169.5", "1.169.8"},
    "@tanstack/arktype-adapter": {"1.166.12", "1.166.15"},
    "@tanstack/eslint-plugin-router": {"1.161.9", "1.161.12"},
    "@tanstack/eslint-plugin-start": {"0.0.4", "0.0.7"},
    "@tanstack/history": {"1.161.9", "1.161.12"},
    "@tanstack/nitro-v2-vite-plugin": {"1.154.12", "1.154.15"},
    "@tanstack/react-router": {"1.169.5", "1.169.8"},
    "@tanstack/react-router-devtools": {"1.166.16", "1.166.19"},
    "@tanstack/react-router-ssr-query": {"1.166.15", "1.166.18"},
    "@tanstack/react-start": {"1.167.68", "1.167.71"},
    "@tanstack/react-start-client": {"1.166.51", "1.166.54"},
    "@tanstack/react-start-rsc": {"0.0.47", "0.0.50"},
    "@tanstack/react-start-server": {"1.166.55", "1.166.58"},
    "@tanstack/router-cli": {"1.166.46", "1.166.49"},
    "@tanstack/router-devtools": {"1.166.16", "1.166.19"},
    "@tanstack/router-devtools-core": {"1.167.6", "1.167.9"},
    "@tanstack/router-generator": {"1.166.45", "1.166.48"},
    "@tanstack/router-plugin": {"1.167.38", "1.167.41"},
    "@tanstack/router-ssr-query-core": {"1.168.3", "1.168.6"},
    "@tanstack/router-vite-plugin": {"1.166.53", "1.166.56"},
    "@tanstack/solid-router": {"1.169.5", "1.169.8"},
    "@tanstack/solid-router-devtools": {"1.166.16", "1.166.19"},
    "@tanstack/solid-router-ssr-query": {"1.166.15", "1.166.18"},
    "@tanstack/solid-start": {"1.167.65", "1.167.68"},
    "@tanstack/solid-start-client": {"1.166.50", "1.166.53"},
    "@tanstack/solid-start-server": {"1.166.54", "1.166.57"},
    "@tanstack/start-client-core": {"1.168.5", "1.168.8"},
    "@tanstack/start-fn-stubs": {"1.161.9", "1.161.12"},
    "@tanstack/start-plugin-core": {"1.169.23", "1.169.26"},
    "@tanstack/start-server-core": {"1.167.33", "1.167.36"},
    "@tanstack/start-static-server-functions": {"1.166.44", "1.166.47"},
    "@tanstack/start-storage-context": {"1.166.38", "1.166.41"},
    "@tanstack/valibot-adapter": {"1.166.12", "1.166.15"},
    "@tanstack/virtual-file-routes": {"1.161.10", "1.161.13"},
    "@tanstack/vue-router": {"1.169.5", "1.169.8"},
    "@tanstack/vue-router-devtools": {"1.166.16", "1.166.19"},
    "@tanstack/vue-router-ssr-query": {"1.166.15", "1.166.18"},
    "@tanstack/vue-start": {"1.167.61", "1.167.64"},
    "@tanstack/vue-start-client": {"1.166.46", "1.166.49"},
    "@tanstack/vue-start-server": {"1.166.50", "1.166.53"},
    "@tanstack/zod-adapter": {"1.166.12", "1.166.15"},
    "@draftauth/client": {"0.2.1", "0.2.2"},
    "@draftauth/core": {"0.13.1", "0.13.2"},
    "@draftlab/auth": {"0.24.1", "0.24.2"},
    "@draftlab/auth-router": {"0.5.1", "0.5.2"},
    "@draftlab/db": {"0.16.1", "0.16.2"},
    "@taskflow-corp/cli": {"0.1.24", "0.1.25", "0.1.26", "0.1.27", "0.1.28", "0.1.29"},
    "@tolka/cli": {"1.0.2", "1.0.3", "1.0.4", "1.0.6"},
    "@uipath/docsai-tool": {"1.0.1"},
    "@uipath/packager-tool-apiworkflow": {"0.0.19"},
    "@uipath/packager-tool-workflowcompiler-browser": {"0.0.34"},
    "@uipath/packager-tool-functions": {"0.1.1"},
    "@uipath/agent.sdk": {"0.0.18"},
    "@uipath/filesystem": {"1.0.1"},
    "@uipath/admin-tool": {"0.1.1"},
    "@uipath/llmgw-tool": {"1.0.1"},
    "@uipath/access-policy-sdk": {"0.3.1"},
    "@uipath/access-policy-tool": {"0.3.1"},
    "@uipath/agent-sdk": {"1.0.2"},
    "@uipath/agent-tool": {"1.0.1"},
    "@uipath/aops-policy-tool": {"0.3.1"},
    "@uipath/ap-chat": {"1.5.7"},
    "@uipath/api-workflow-tool": {"1.0.1"},
    "@uipath/apollo-core": {"5.9.2"},
    "@uipath/apollo-react": {"4.24.5"},
    "@uipath/apollo-wind": {"2.16.2"},
    "@uipath/auth": {"1.0.1"},
    "@uipath/case-tool": {"1.0.1"},
    "@uipath/cli": {"1.0.1"},
    "@uipath/codedagent-tool": {"1.0.1"},
    "@uipath/codedagents-tool": {"0.1.12"},
    "@uipath/codedapp-tool": {"1.0.1"},
    "@uipath/common": {"1.0.1"},
    "@uipath/context-grounding-tool": {"0.1.1"},
    "@uipath/data-fabric-tool": {"1.0.2"},
    "@uipath/flow-tool": {"1.0.2"},
    "@uipath/functions-tool": {"1.0.1"},
    "@uipath/gov-tool": {"0.3.1"},
    "@uipath/identity-tool": {"0.1.1"},
    "@uipath/insights-sdk": {"1.0.1"},
    "@uipath/insights-tool": {"1.0.1"},
    "@uipath/integrationservice-sdk": {"1.0.2"},
    "@uipath/integrationservice-tool": {"1.0.2"},
    "@uipath/maestro-sdk": {"1.0.1"},
    "@uipath/maestro-tool": {"1.0.1"},
    "@uipath/orchestrator-tool": {"1.0.1"},
    "@uipath/packager-tool-bpmn": {"0.0.9"},
    "@uipath/packager-tool-case": {"0.0.9"},
    "@uipath/packager-tool-connector": {"0.0.19"},
    "@uipath/packager-tool-flow": {"0.0.19"},
    "@uipath/packager-tool-webapp": {"1.0.6"},
    "@uipath/packager-tool-workflowcompiler": {"0.0.16"},
    "@uipath/platform-tool": {"1.0.1"},
    "@uipath/project-packager": {"1.1.16"},
    "@uipath/resource-tool": {"1.0.1"},
    "@uipath/resourcecatalog-tool": {"0.1.1"},
    "@uipath/resources-tool": {"0.1.11"},
    "@uipath/robot": {"1.3.4"},
    "@uipath/rpa-legacy-tool": {"1.0.1"},
    "@uipath/rpa-tool": {"0.9.5"},
    "@uipath/solution-packager": {"0.0.35"},
    "@uipath/solution-tool": {"1.0.1"},
    "@uipath/solutionpackager-sdk": {"1.0.11"},
    "@uipath/solutionpackager-tool-core": {"0.0.34"},
    "@uipath/tasks-tool": {"1.0.1"},
    "@uipath/telemetry": {"0.0.7"},
    "@uipath/test-manager-tool": {"1.0.2"},
    "@uipath/tool-workflowcompiler": {"0.0.12"},
    "@uipath/traces-tool": {"1.0.1"},
    "@uipath/ui-widgets-multi-file-upload": {"1.0.1"},
    "@uipath/uipath-python-bridge": {"1.0.1"},
    "@uipath/vertical-solutions-tool": {"1.0.1"},
    "@uipath/vss": {"0.1.6"},
    "@uipath/widget.sdk": {"1.2.3"},
    "safe-action": {"0.8.3", "0.8.4"},
    "@supersurkhet/cli": {"0.0.2", "0.0.3", "0.0.4", "0.0.5", "0.0.6", "0.0.7"},
    "@supersurkhet/sdk": {"0.0.2", "0.0.3", "0.0.4", "0.0.5", "0.0.6", "0.0.7"},
    "cmux-agent-mcp": {"0.1.3", "0.1.4", "0.1.5", "0.1.6", "0.1.7", "0.1.8"},
    "git-git-git": {"1.0.8", "1.0.9", "1.0.10", "1.0.12"},
    "git-branch-selector": {"1.3.3", "1.3.4", "1.3.5", "1.3.7"},
    "nextmove-mcp": {"0.1.3", "0.1.4", "0.1.5", "0.1.7"},
    "@beproduct/nestjs-auth": {"0.1.2", "0.1.3", "0.1.4", "0.1.5", "0.1.6", "0.1.7", "0.1.8",
                              "0.1.9", "0.1.10", "0.1.11", "0.1.12", "0.1.13", "0.1.14",
                              "0.1.15", "0.1.16", "0.1.17", "0.1.19"},
    "@dirigible-ai/sdk": {"0.6.2", "0.6.3"},
    "@ml-toolkit-ts/preprocessing": {"1.0.2", "1.0.3"},
    "@ml-toolkit-ts/xgboost": {"1.0.3", "1.0.4"},
    "agentwork-cli": {"0.1.4", "0.1.5"},
    "ml-toolkit-ts": {"1.0.4", "1.0.5"},
    "@squawk/airways": {"0.4.2", "0.4.3", "0.4.5"},
    "@squawk/airport-data": {"0.7.4", "0.7.5", "0.7.7"},
    "@squawk/airports": {"0.6.2", "0.6.3", "0.6.5"},
    "@squawk/airspace": {"0.8.1", "0.8.2", "0.8.4"},
    "@squawk/airspace-data": {"0.5.3", "0.5.4", "0.5.6"},
    "@squawk/airway-data": {"0.5.4", "0.5.5", "0.5.7"},
    "@squawk/fix-data": {"0.6.4", "0.6.5", "0.6.7"},
    "@squawk/fixes": {"0.3.2", "0.3.3", "0.3.5"},
    "@squawk/flight-math": {"0.5.4", "0.5.5", "0.5.7"},
    "@squawk/flightplan": {"0.5.2", "0.5.3", "0.5.5"},
    "@squawk/geo": {"0.4.4", "0.4.5", "0.4.7"},
    "@squawk/icao-registry": {"0.5.2", "0.5.3", "0.5.5"},
    "@squawk/icao-registry-data": {"0.8.4", "0.8.5", "0.8.7"},
    "@squawk/mcp": {"0.9.1", "0.9.2", "0.9.4"},
    "@squawk/navaid-data": {"0.6.4", "0.6.5", "0.6.7"},
    "@squawk/navaids": {"0.4.2", "0.4.3", "0.4.5"},
    "@squawk/notams": {"0.3.6", "0.3.7", "0.3.9"},
    "@squawk/procedure-data": {"0.7.3", "0.7.4", "0.7.6"},
    "@squawk/procedures": {"0.5.2", "0.5.3", "0.5.5"},
    "@squawk/types": {"0.8.1", "0.8.2", "0.8.4"},
    "@squawk/units": {"0.4.3", "0.4.4", "0.4.6"},
    "@squawk/weather": {"0.5.6", "0.5.7", "0.5.9"},
    "wot-api": {"0.8.1", "0.8.2", "0.8.4"},
    "cross-stitch": {"1.1.3", "1.1.4", "1.1.6"},
    "ts-dna": {"3.0.1", "3.0.2", "3.0.4"},
    "@tallyui/components": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/connector-medusa": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/connector-shopify": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/connector-vendure": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/connector-woocommerce": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/core": {"0.2.1", "0.2.2", "0.2.3"},
    "@tallyui/database": {"1.0.1", "1.0.2", "1.0.3"},
    "@tallyui/pos": {"0.1.1", "0.1.2", "0.1.3"},
    "@tallyui/storage-sqlite": {"0.2.1", "0.2.2", "0.2.3"},
    "@tallyui/theme": {"0.2.1", "0.2.2", "0.2.3"},
    "@mesadev/rest": {"0.28.3"},
    "@mesadev/saguaro": {"0.4.22"},
    "@mesadev/sdk": {"0.28.3"},
}

# PyPI: nome normalizado -> versões comprometidas
PYPI_BAD = {
    "mistralai": {"2.4.6"},
    "guardrails-ai": {"0.10.1"},
}

# ----------------------------------------------------------------------------
# Coleta de achados
# ----------------------------------------------------------------------------

findings = []  # cada item: (severidade, categoria, detalhe)

def report(sev, cat, detail):
    findings.append({"severity": sev, "category": cat, "detail": detail})

def sha256(path):
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None

SKIP_DIRS = {".git", ".cache", "__pycache__", ".venv", "venv", ".tox"}

def walk(root):
    """Walk que não segue symlinks e pula diretórios ruidosos (exceto node_modules)."""
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        yield dirpath, dirnames, filenames

# --- 1. Lockfiles npm/pnpm/yarn ---------------------------------------------

def check_npm_lock(path):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8", errors="ignore"))
    except (OSError, json.JSONDecodeError):
        return
    pkgs = data.get("packages", {})
    for key, meta in pkgs.items():
        if not key.startswith("node_modules/"):
            continue
        name = key.split("node_modules/")[-1]
        ver = meta.get("version")
        if name in NPM_BAD and ver in NPM_BAD[name]:
            report("CRITICAL", "npm-lockfile", f"{name}@{ver} em {path}")
    # formato legado (lockfileVersion 1): dependencies aninhadas
    def recurse(deps):
        for name, meta in (deps or {}).items():
            ver = meta.get("version")
            if name in NPM_BAD and ver in NPM_BAD[name]:
                report("CRITICAL", "npm-lockfile", f"{name}@{ver} em {path}")
            recurse(meta.get("dependencies"))
    recurse(data.get("dependencies"))

VER_RE = re.compile(r'^\s*version[:=]?\s*["\']?([0-9][^"\'\s]*)', re.M)

def check_text_lock(path):
    """pnpm-lock.yaml / yarn.lock: varredura textual (heurística mas eficaz)."""
    try:
        text = Path(path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return
    for name, vers in NPM_BAD.items():
        if name not in text:
            continue
        for v in vers:
            # padrões comuns: name@1.2.3, /name@1.2.3, "name" ... "1.2.3"
            if re.search(rf'{re.escape(name)}[@:"\s/]+.{{0,40}}{re.escape(v)}', text):
                report("CRITICAL", "lockfile", f"possível {name}@{v} em {path}")

# --- 2. router_init.js / hashes / optionalDependencies ----------------------

def check_payload_files(dirpath, filenames):
    for fn in filenames:
        if fn in ("router_init.js", "tanstack_runner.js"):
            full = os.path.join(dirpath, fn)
            digest = sha256(full)
            label = KNOWN_HASHES.get(digest)
            if label:
                report("CRITICAL", "payload-hash", f"{full} = {label} (hash bate)")
            else:
                report("HIGH", "payload-name", f"{full} (nome suspeito, hash não confirmado)")
        if fn == "package.json":
            full = os.path.join(dirpath, fn)
            try:
                data = json.loads(Path(full).read_text(encoding="utf-8", errors="ignore"))
            except (OSError, json.JSONDecodeError):
                continue
            optdeps = data.get("optionalDependencies", {})
            for dname, dspec in optdeps.items():
                if MALICIOUS_OPTDEP_MARKER in dname or MALICIOUS_GITHUB_COMMIT in str(dspec):
                    report("CRITICAL", "optional-dependency",
                           f"{full}: optionalDependency maliciosa {dname} -> {dspec}")

# --- 3. Persistência em repos -----------------------------------------------

def check_repo_persistence(dirpath, dirnames):
    for rel in REPO_PERSISTENCE:
        p = os.path.join(dirpath, rel)
        if os.path.isfile(p):
            report("CRITICAL", "persistence-file", p)
    for rel, (needle, also) in REPO_SUSPICIOUS.items():
        p = os.path.join(dirpath, rel)
        if os.path.isfile(p):
            try:
                content = Path(p).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            hit = needle in content and (also is None or also in content)
            if hit:
                report("CRITICAL", "persistence-config", f"{p} contém '{needle}'")

# --- 4. C2 e workflows ------------------------------------------------------

def check_c2_in_file(path):
    try:
        text = Path(path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return
    for dom in C2_DOMAINS:
        if dom in text:
            report("HIGH", "c2-reference", f"domínio C2 '{dom}' em {path}")
    if RANSOM_TOKEN_DESC in text:
        report("CRITICAL", "ransom-string", f"string de resgate em {path}")

# --- 5. Persistência a nível de SO no $HOME ---------------------------------

def check_os_persistence(home):
    for rel in OS_PERSISTENCE:
        p = os.path.join(home, rel)
        if os.path.exists(p):
            report("CRITICAL", "os-persistence", p)

def check_grep_targets(home):
    for rel in GREP_TARGETS:
        p = os.path.join(home, rel)
        if os.path.isfile(p):
            check_c2_in_file(p)

# --- 6. PyPI instalado ------------------------------------------------------

def check_pypi():
    try:
        out = subprocess.run([sys.executable, "-m", "pip", "list", "--format=json"],
                             capture_output=True, text=True, timeout=30)
        pkgs = json.loads(out.stdout or "[]")
    except Exception:
        report("INFO", "pypi", "não consegui rodar pip list (cheque manualmente)")
        return
    for pkg in pkgs:
        name = pkg.get("name", "").lower().replace("_", "-")
        ver = pkg.get("version")
        if name in PYPI_BAD and ver in PYPI_BAD[name]:
            report("CRITICAL", "pypi", f"{name}=={ver} instalado neste ambiente")

# --- 7. Token npm com descrição-resgate (READ-ONLY) -------------------------

def check_npm_tokens():
    if not _which("npm"):
        return
    try:
        out = subprocess.run(["npm", "token", "list"],
                             capture_output=True, text=True, timeout=30)
        blob = (out.stdout or "") + (out.stderr or "")
    except Exception:
        return
    if RANSOM_TOKEN_DESC in blob:
        report("CRITICAL", "ransom-token",
               "TOKEN NPM COM DESCRIÇÃO-RESGATE DETECTADO. "
               "NÃO REVOGUE — isole e imagem a máquina primeiro (a revogação dispara wipe).")

def _which(cmd):
    for d in os.environ.get("PATH", "").split(os.pathsep):
        if os.path.isfile(os.path.join(d, cmd)):
            return True
    return False

# --- 8. git dead-drop -------------------------------------------------------

def check_git_repo(repo_root):
    git_dir = os.path.join(repo_root, ".git")
    if not os.path.isdir(git_dir):
        return
    try:
        out = subprocess.run(
            ["git", "-C", repo_root, "log", "--all",
             "--pretty=%ae|%s|%D", "-n", "500"],
            capture_output=True, text=True, timeout=30)
    except Exception:
        return
    for line in (out.stdout or "").splitlines():
        parts = line.split("|", 2)
        if len(parts) < 2:
            continue
        author, subject = parts[0], parts[1]
        refs = parts[2] if len(parts) > 2 else ""
        if author == DEAD_DROP_AUTHOR and DEAD_DROP_MSG in subject:
            report("CRITICAL", "git-deaddrop",
                   f"{repo_root}: commit dead-drop ({author}: '{subject}')")
        if DUNE_BRANCH_RE.search(refs):
            report("HIGH", "git-deaddrop", f"{repo_root}: branch suspeita '{refs.strip()}'")

# ----------------------------------------------------------------------------
# Orquestração
# ----------------------------------------------------------------------------

def scan(roots):
    home = os.path.expanduser("~")
    check_os_persistence(home)
    check_grep_targets(home)
    check_pypi()
    check_npm_tokens()

    seen_git = set()
    for root in roots:
        root = os.path.abspath(os.path.expanduser(root))
        if not os.path.exists(root):
            report("INFO", "scan", f"caminho inexistente: {root}")
            continue
        for dirpath, dirnames, filenames in walk(root):
            for fn in filenames:
                low = fn.lower()
                if low in ("package-lock.json",):
                    check_npm_lock(os.path.join(dirpath, fn))
                elif low in ("pnpm-lock.yaml", "yarn.lock"):
                    check_text_lock(os.path.join(dirpath, fn))
            check_payload_files(dirpath, filenames)
            check_repo_persistence(dirpath, dirnames)
            if ".git" in dirnames and dirpath not in seen_git:
                seen_git.add(dirpath)
                check_git_repo(dirpath)

# ----------------------------------------------------------------------------

SEV_ORDER = {"CRITICAL": 0, "HIGH": 1, "INFO": 2}

def main():
    ap = argparse.ArgumentParser(description="Scanner de IOCs do Mini Shai-Hulud (read-only).")
    ap.add_argument("paths", nargs="*", help="Caminhos a escanear (default: ~ e .)")
    ap.add_argument("--json", action="store_true", help="Saída em JSON")
    args = ap.parse_args()

    roots = args.paths or [os.path.expanduser("~"), os.getcwd()]
    scan(roots)

    findings.sort(key=lambda f: (SEV_ORDER.get(f["severity"], 9), f["category"]))

    if args.json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
        sys.exit(1 if any(f["severity"] == "CRITICAL" for f in findings) else 0)

    crit = [f for f in findings if f["severity"] == "CRITICAL"]
    high = [f for f in findings if f["severity"] == "HIGH"]
    info = [f for f in findings if f["severity"] == "INFO"]

    print("=" * 72)
    print("  Mini Shai-Hulud — relatório de varredura")
    print("=" * 72)
    if not crit and not high:
        print("\n  Nenhum IOC crítico ou alto encontrado nos caminhos varridos.")
        print("  Isso NÃO é um atestado de limpeza — só significa que estes IOCs")
        print("  específicos não apareceram. Mantenha a higiene de mitigação.\n")
    for label, group in (("CRÍTICO", crit), ("ALTO", high), ("INFO", info)):
        if group:
            print(f"\n[{label}] ({len(group)})")
            for f in group:
                print(f"  - {f['category']}: {f['detail']}")
    if any(f["category"] in ("ransom-token", "ransom-string") for f in crit):
        print("\n" + "!" * 72)
        print("  TOKEN/STRING DE RESGATE DETECTADO. NÃO REVOGUE NADA.")
        print("  Isole a máquina da rede e faça imagem forense ANTES de qualquer ação.")
        print("!" * 72)
    print()
    sys.exit(1 if crit else 0)

if __name__ == "__main__":
    main()
