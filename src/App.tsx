import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import TempoPermanencia from "./pages/relatorios/TempoPermanencia";
import NaoAcessantes from "./pages/relatorios/NaoAcessantesLab";
import RelatorioTempo from "./pages/relatorios/PermanenciaTotalLab";
import RelatorioRecente from "./pages/relatorios/UltimoMesLab";
import RelatorioTreinamento from "./pages/relatorios/TreinamentosExpirados";
import RelatorioNaoExpirados from "./pages/relatorios/TreinamentosNaoExpirados";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/upload" element={<Upload />} />
      <Route path="/relatorioTempo" element={<RelatorioTempo />} />
      <Route path="/tempoPermanencia" element={<TempoPermanencia />} />
      <Route path="/naoAcessantes" element={<NaoAcessantes/>}/>
      <Route path="/relatorioRecente" element={<RelatorioRecente/>}/>
      <Route path="/relatorioTreinamento" element={<RelatorioTreinamento/>}/>
      <Route path="/relatorioNaoExpirados" element={<RelatorioNaoExpirados/>}/>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
