export default function ConfiguracoesAdmin() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
      <div className="d-flex align-items-center justify-content-center mb-3"
        style={{ width: "64px", height: "64px", backgroundColor: "rgba(40, 167, 69, 0.12)", borderRadius: "50%" }}>
        <i className="fas fa-cogs" style={{ color: "#28a745", fontSize: "27px" }}></i>
      </div>
      <h5 className="font-weight-bold text-dark mb-2">Configurações</h5>
      <p className="text-muted mb-0" style={{ maxWidth: "420px" }}>
        Não há configurações administrativas disponíveis no momento.
      </p>
    </div>
  );
}
