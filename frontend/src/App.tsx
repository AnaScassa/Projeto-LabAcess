import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import TempoPermanencia from "./pages/relatorios/TempoPermanencia";
import NaoAcessantes from "./pages/relatorios/NaoAcessantesLab";
import RelatorioTempo from "./pages/relatorios/PermanenciaTotalLab";
import RelatorioRecente from "./pages/relatorios/UltimoMesLab";
import RelatorioTreinamento from "./pages/relatorios/TreinamentosExpirados";
import RelatorioNaoExpirados from "./pages/relatorios/TreinamentosNaoExpirados";
import Login from "./pages/Login";
import PrivateRoute from "../src/routes/PrivateRoute"
import RelatorioTreinamentoPendente from "./pages/relatorios/TreinamentoPendente";
import TreinamentosPendentesNaoTreinados from "./pages/relatorios/TreinamentosPendentesNaoTreinados";
import Emails from "./pages/Emails";
import Agendamento from "./pages/Agendamento";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/relatorio-tempo" element={<PrivateRoute><RelatorioTempo /></PrivateRoute>} />
      <Route path="/tempo-permanencia" element={<PrivateRoute><TempoPermanencia /></PrivateRoute>} />
      <Route path="/nao-acessantes" element={<PrivateRoute><NaoAcessantes/></PrivateRoute>}/>
      <Route path="/relatorio-recente" element={<PrivateRoute><RelatorioRecente/></PrivateRoute>}/>
      <Route path="/relatorio-treinamento" element={<PrivateRoute><RelatorioTreinamento/></PrivateRoute>}/>
      <Route path="/relatorio-nao-expirados" element={<PrivateRoute><RelatorioNaoExpirados/></PrivateRoute>}/>
      <Route path="/relatorio-treinamento-pendente" element={<PrivateRoute><RelatorioTreinamentoPendente/></PrivateRoute>}/>
      <Route path="/email" element={<PrivateRoute><Emails/></PrivateRoute>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/relatorio-treinamentos-pendentes-nao-treinados" element={<PrivateRoute><TreinamentosPendentesNaoTreinados/></PrivateRoute>}/>
      <Route path="/agendamento" element={<PrivateRoute><Agendamento/></PrivateRoute>}/>
    </Routes>
  );
}
