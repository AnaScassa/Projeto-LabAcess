import { Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import TempoPermanencia from "./pages/TempoPermanencia";
import NaoAcessantes from "./pages/NaoAcessantes";
import RelatorioTempo from "./pages/RelatorioTempo";
import Login from "./pages/Login";
import RelatorioRecente from "./pages/RelatorioRecente";

export default function App() {
  return (
    <Routes>
      <Route path="/upload" element={<Upload />} />
      <Route path="/relatorioTempo" element={<RelatorioTempo />} />
      <Route path="/tempoPermanencia" element={<TempoPermanencia />} />
      <Route path="/naoAcessantes" element={<NaoAcessantes/>}/>
      <Route path="/relatorioRecente" element={<RelatorioRecente/>}/>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
