import { useState } from 'react';

export default function LandingPage({ onSubmit }) {
  const [form, setForm] = useState({
    nome: '',
    clinica: '',
    email: '',
    cidade: '',
  });

  const isValid = form.nome && form.clinica && form.email;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onSubmit(form);
  };

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

      <form className="lead-form fade-up fade-up-delay-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Seu nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Nome da clínica"
          value={form.clinica}
          onChange={(e) => setForm({ ...form, clinica: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Cidade (opcional)"
          value={form.cidade}
          onChange={(e) => setForm({ ...form, cidade: e.target.value })}
        />
        <button type="submit" className="btn-primary" disabled={!isValid}>
          Fazer Meu Diagnóstico Gratuito
        </button>
      </form>

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
