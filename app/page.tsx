import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="eyebrow">STARTUPIA · ECOSISTEMA EMPRENDEDOR</div>
        <h1>Piensa en grande.<br /><span className="gradient-text">Empieza inteligente.</span></h1>
        <p className="lead">De la idea a una startup real: herramientas de inteligencia artificial, gestión y mentoría para avanzar con claridad.</p>
        <div className="actions">
          <Link href="/login" className="button">Entrar a Startupia OS</Link>
          <Link href="/#solucion" className="button button-ghost">Explorar el ecosistema</Link>
        </div>
        <div className="hero-display" aria-label="Principios de Startupia">
          <div><span className="small">01 / VALIDAR</span><strong>Comprende el problema.</strong></div>
          <div><span className="small">02 / CONSTRUIR</span><strong>Crea lo esencial.</strong></div>
          <div><span className="small">03 / CRECER</span><strong>Decide con evidencia.</strong></div>
        </div>
      </section>
      <section id="solucion" className="section wrap">
        <div className="eyebrow">UN SISTEMA, UNA VISIÓN</div>
        <h2>Menos fragmentación.<br />Más ejecución.</h2>
        <div className="tiles">
          <article className="tile"><span className="small">STARTUPIA OS</span><h3>Organiza y ejecuta.</h3><p>Workspace, seguimiento empresarial y copiloto conectado al contexto de tu negocio.</p><Link href="/login">Acceder al sistema</Link></article>
          <article className="tile"><span className="small">STARTUPIA MENTORS</span><h3>Aprende de expertos.</h3><p>Acompañamiento especializado para decisiones clave de estrategia, producto y crecimiento.</p><Link href="/mentors">Conocer Mentors</Link></article>
          <article className="tile"><span className="small">BUILD / GROWTH</span><h3>Crece a tu ritmo.</h3><p>Dos niveles de servicio que comparten la misma cuenta, los mismos datos y el mismo espacio de trabajo.</p><Link href="/login">Consultar mi acceso</Link></article>
        </div>
        <p className="note">La contratación y las funciones avanzadas se habilitarán únicamente cuando las integraciones hayan sido verificadas. No se procesan pagos desde esta versión.</p>
      </section>
    </>
  );
}
