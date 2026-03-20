export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-logo">
        LK <span>Digital</span>
      </div>

      <h1 className="fade-up">
        Descubra quanto dinheiro seu consultório está <em>perdendo</em>
      </h1>

      <p className="subtitle fade-up fade-up-delay-1">
        Uma ferramenta gratuita que revela as perdas invisíveis da sua clínica
        odontológica — em menos de 2 minutos.
      </p>

      <div className="fade-up fade-up-delay-2">
        <button className="btn-primary" onClick={onStart}>
          Fazer Meu Diagnóstico Gratuito
        </button>
      </div>

      <div className="landing-features fade-up fade-up-delay-3">
        <div className="landing-feature">
          <div className="number">2 min</div>
          <p>Para preencher</p>
        </div>
        <div className="landing-feature">
          <div className="number">100%</div>
          <p>Gratuito</p>
        </div>
        <div className="landing-feature">
          <div className="number">5</div>
          <p>Sistemas para corrigir</p>
        </div>
      </div>

      <div className="footer">
        <a href="https://lkdigital.odo.br" target="_blank" rel="noopener noreferrer">
          lkdigital.odo.br
        </a>
      </div>
    </div>
  );
}
