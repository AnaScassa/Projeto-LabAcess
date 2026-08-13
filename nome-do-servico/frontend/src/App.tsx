import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/relatorioTempo" element={<PrivateRoute><RelatorioTempo /></PrivateRoute>} />
      <Route path="/tempoPermanencia" element={<PrivateRoute><TempoPermanencia /></PrivateRoute>} />
      <Route path="/naoAcessantes" element={<PrivateRoute><NaoAcessantes/></PrivateRoute>}/>
      <Route path="/relatorioRecente" element={<PrivateRoute><RelatorioRecente/></PrivateRoute>}/>
      <Route path="/relatorioTreinamento" element={<PrivateRoute><RelatorioTreinamento/></PrivateRoute>}/>
      <Route path="/relatorioNaoExpirados" element={<PrivateRoute><RelatorioNaoExpirados/></PrivateRoute>}/>
      <Route path="/relatorioTreinamentoPendente" element={<PrivateRoute><RelatorioTreinamentoPendente/></PrivateRoute>}/>
      <Route path="/email" element={<PrivateRoute><Emails/></PrivateRoute>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/TreinamentosPendentesNaoTreinados" element={<PrivateRoute><TreinamentosPendentesNaoTreinados/></PrivateRoute>}/>
    </Routes>
  );
}
