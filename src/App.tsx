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
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
