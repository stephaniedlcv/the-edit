import { getStyleProfile } from "@/lib/profile/data";

const ST_STYLES = `
  .st-wrap {
    padding-bottom: calc(9rem + env(safe-area-inset-bottom, 0px));
  }

  /* ── Editorial header ───────────────────────────────────────────── */
  .st-header {
    padding: 3.5rem 1.5rem 2rem;
    max-width: 72rem;
    margin: 0 auto;
    border-bottom: 1px solid rgba(122,46,53,0.10);
  }
  @media (min-width: 768px) {
    .st-header { padding: 4.5rem 2.5rem 2.5rem; }
  }

  .st-eyebrow {
    font-size: 0.54rem;
    font-weight: 800;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--caramel);
    margin-bottom: 0.75rem;
    display: block;
  }
  .st-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: clamp(2.8rem, 9vw, 5rem);
    line-height: 0.93;
    color: var(--espresso);
    margin: 0;
    font-weight: 400;
    font-style: italic;
  }
  .st-subcopy {
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 46ch;
    margin-top: 1.1rem;
  }

  /* ── Section titles ─────────────────────────────────────────────── */
  .st-section-head {
    margin-bottom: 1.75rem;
  }
  .st-section-eyebrow {
    font-size: 0.52rem;
    font-weight: 800;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--caramel);
    display: block;
    margin-bottom: 0.5rem;
  }
  .st-section-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: 2.4rem;
    line-height: 1;
    color: var(--espresso);
    font-weight: 400;
    margin: 0;
  }
  .st-section-desc {
    font-size: 0.875rem;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 54ch;
    margin-top: 0.6rem;
  }

  /* ── Cards ──────────────────────────────────────────────────────── */
  .st-card {
    border-radius: 6px;
    border: 1px solid rgba(122,46,53,0.12);
    background: var(--paper-2);
    padding: 1.75rem;
  }
  .st-card-light {
    border-radius: 6px;
    border: 1px solid rgba(122,46,53,0.10);
    background: var(--paper);
    padding: 1.75rem;
    box-shadow: 0 4px 18px rgba(36,26,18,0.05);
  }
  .st-rule-card {
    border-radius: 6px;
    border: 1px solid rgba(122,46,53,0.10);
    background: var(--paper);
    padding: 1.4rem 1.5rem;
    box-shadow: 0 4px 18px rgba(36,26,18,0.04);
  }

  /* ── Micro labels ───────────────────────────────────────────────── */
  .st-label {
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--caramel);
    display: block;
    margin-bottom: 0.4rem;
  }
  .st-value {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.9rem;
    line-height: 1.05;
    color: var(--espresso);
    margin: 0;
  }
  .st-note {
    font-size: 0.78rem;
    line-height: 1.65;
    color: var(--ink-soft);
    margin-top: 0.5rem;
  }

  /* ── Color swatches ─────────────────────────────────────────────── */
  .st-swatch {
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(122,46,53,0.10);
    background: var(--paper);
    box-shadow: 0 4px 18px rgba(36,26,18,0.05);
  }
  .st-swatch-bar {
    height: 8.5rem;
    position: relative;
    overflow: hidden;
  }
  .st-swatch-grid {
    position: absolute;
    inset: 0;
    opacity: 0.12;
    background-image: linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px),
                      linear-gradient(0deg,rgba(255,255,255,0.35) 1px,transparent 1px);
    background-size: 20px 20px;
  }
  .st-swatch-ring {
    position: absolute;
    top: 12px;
    left: -20px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.35);
  }
  .st-swatch-body {
    padding: 1rem 1.15rem 1.25rem;
  }
  .st-swatch-role {
    font-size: 0.49rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--caramel);
    display: block;
    margin-bottom: 0.35rem;
  }
  .st-swatch-name {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.35rem;
    line-height: 1.1;
    color: var(--espresso);
    margin: 0;
  }

  /* ── Rule cards ─────────────────────────────────────────────────── */
  .st-rule-title {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.35rem;
    line-height: 1.15;
    color: var(--espresso);
    margin: 0 0 0.65rem 0;
  }
  .st-rule-body {
    font-size: 0.875rem;
    line-height: 1.8;
    color: var(--ink-soft);
  }

  /* ── AI rules ───────────────────────────────────────────────────── */
  .st-ai-card {
    border-radius: 6px;
    padding: 1.75rem;
    background: linear-gradient(150deg, #FBF7EE 0%, #F6EFE0 60%, #F1E8D5 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(161,122,53,0.18), 0 24px 60px rgba(36,26,18,0.10);
  }
  .st-ai-rule {
    display: grid;
    grid-template-columns: 2rem 1fr;
    gap: 1rem;
    border-top: 1px solid rgba(200,151,58,0.15);
    padding-top: 1rem;
    margin-top: 1rem;
  }
  .st-ai-rule:first-child {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }
  .st-ai-num {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.6rem;
    color: var(--caramel);
    opacity: 0.5;
    line-height: 1;
  }
  .st-ai-text {
    font-size: 0.875rem;
    line-height: 1.8;
    color: var(--coffee);
  }

  /* ── Goals list ─────────────────────────────────────────────────── */
  .st-goal-item {
    border-bottom: 1px solid rgba(122,46,53,0.10);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.75;
    color: var(--ink-soft);
  }
  .st-goal-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
`;

const PALETTE_TONE: Record<string, string> = {
  black:     "#2b241f",
  brown:     "#4b2f22",
  cream:     "#ead9c3",
  beige:     "#d5b895",
  white:     "#f3eadf",
  burgundy:  "#6b2d2f",
  olive:     "#586143",
  camel:     "#b7814f",
  plum:      "#604052",
  mustard:   "#b8892f",
  denim:     "#30455b",
  blue:      "#344f6f",
  statement: "#a65f3f",
};

const MEASUREMENT_ES: Record<string, string> = {
  Bust:    "Busto",
  Waist:   "Cintura",
  Hips:    "Cadera",
  Glutes:  "Glúteos",
};

const IDENTITY_LABEL_ES: Record<string, string> = {
  Palette:    "Paleta",
  Silhouette: "Silueta",
  Climate:    "Clima",
  Aesthetic:  "Estética",
};

export default async function SettingsPage() {
  const profile = await getStyleProfile();

  return (
    <section className="st-wrap">
      <style href="st-cromatica" precedence="component">{ST_STYLES}</style>

      {/* ── Editorial header ──────────────────────────────────────────── */}
      <div className="st-header">
        <span className="st-eyebrow">PERFIL · CROMÁTICA</span>
        <h1 className="st-title">Tu sistema de estilo.</h1>
        <p className="st-subcopy">
          Tus reglas de color, silueta, clima y compra para que THE EDIT
          recomiende con intención.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

        {/* ── Identidad + Medidas ────────────────────────────────────── */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.2fr_0.8fr]">

          <article className="st-card">
            <span className="st-section-eyebrow">Identidad</span>
            <h2 className="font-display text-[2.6rem] leading-none text-[var(--espresso)] md:text-5xl">
              {profile.identity.styleSystem}
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {(
                [
                  { label: "Palette",    value: profile.identity.palette },
                  { label: "Silhouette", value: profile.identity.silhouette },
                  { label: "Climate",    value: profile.identity.location },
                  { label: "Aesthetic",  value: profile.identity.aesthetic },
                ] as { label: string; value: string }[]
              ).map((item) => (
                <div key={item.label}>
                  <span className="st-label">{IDENTITY_LABEL_ES[item.label] ?? item.label}</span>
                  <p className="font-display mt-1 text-[1.55rem] leading-tight text-[var(--espresso)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="st-card-light">
            <span className="st-section-eyebrow">Medidas</span>
            <div className="grid grid-cols-2 gap-5">
              {profile.measurements.map((m) => (
                <div key={m.label} className="border-b border-[rgba(122,46,53,0.10)] pb-4">
                  <span className="st-label">{MEASUREMENT_ES[m.label] ?? m.label}</span>
                  <p className="font-display mt-1 text-[2.2rem] leading-none text-[var(--espresso)]">
                    {m.value}
                  </p>
                  <p className="st-note">{m.note}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ── Sistema de color ──────────────────────────────────────── */}
        <section className="mt-12">
          <div className="st-section-head">
            <span className="st-section-eyebrow">Sistema de color</span>
            <h2 className="st-section-title">Paleta Dark Autumn</h2>
            <p className="st-section-desc">
              Colores base e intensidades que guían el scoring de wishlist,
              las fórmulas de outfits y las recomendaciones de estilismo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profile.palette.map((color) => {
              const tone = PALETTE_TONE[color.family] ?? PALETTE_TONE.brown;
              return (
                <article key={color.name} className="st-swatch">
                  <div
                    className="st-swatch-bar"
                    style={{
                      background: `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.36), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.24), ${tone} 48%, rgba(26,16,8,0.54))`,
                    }}
                  >
                    <div className="st-swatch-grid" />
                    <div className="st-swatch-ring" />
                    <div className="absolute bottom-3 left-5 h-px w-12 bg-white/40" />
                  </div>
                  <div className="st-swatch-body">
                    <span className="st-swatch-role">{color.role}</span>
                    <h3 className="st-swatch-name">{color.name}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Lógica de silueta ────────────────────────────────────── */}
        <section className="mt-12">
          <div className="st-section-head">
            <span className="st-section-eyebrow">Lógica de silueta</span>
            <h2 className="st-section-title">Reglas Bottom Hourglass</h2>
            <p className="st-section-desc">
              Estas reglas dan forma a las recomendaciones de outfits,
              los veredictos de wishlist y los avisos de talla.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {profile.fitRules.map((rule) => (
              <article key={rule.title} className="st-rule-card">
                <h3 className="st-rule-title">{rule.title}</h3>
                <p className="st-rule-body">{rule.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Disciplina de compra + Clima ─────────────────────────── */}
        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="st-section-head">
              <span className="st-section-eyebrow">Disciplina de compra</span>
              <h2 className="st-section-title">Reglas de La Lista</h2>
              <p className="st-section-desc">
                La capa de decisión que mantiene el clóset intencional
                en lugar de impulsivo.
              </p>
            </div>
            <div className="grid gap-4">
              {profile.shoppingRules.map((rule) => (
                <article key={rule.title} className="st-rule-card">
                  <h3 className="st-rule-title">{rule.title}</h3>
                  <p className="st-rule-body">{rule.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="st-section-head">
              <span className="st-section-eyebrow">Lógica climática</span>
              <h2 className="st-section-title">Reglas para Puerto Rico</h2>
              <p className="st-section-desc">
                Reglas de calor, humedad y lluvia para las recomendaciones
                de outfits del día a día.
              </p>
            </div>
            <div className="grid gap-4">
              {profile.climateRules.map((rule) => (
                <article key={rule.title} className="st-rule-card">
                  <h3 className="st-rule-title">{rule.title}</h3>
                  <p className="st-rule-body">{rule.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Objetivos + Motor ────────────────────────────────────── */}
        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          <article className="st-card">
            <span className="st-section-eyebrow">Objetivos de cápsula</span>
            <ul className="mt-4">
              {profile.capsuleGoals.map((goal) => (
                <li key={goal} className="st-goal-item">
                  {goal}
                </li>
              ))}
            </ul>
          </article>

          <article className="st-ai-card">
            <span className="st-section-eyebrow">Instrucciones al motor de estilo</span>
            <h2 className="font-display text-[2.2rem] leading-none text-[var(--espresso)] md:text-4xl">
              Tus reglas. Tu edición.
            </h2>
            <div className="mt-6">
              {profile.aiRules.map((rule, i) => (
                <div key={rule} className="st-ai-rule">
                  <span className="st-ai-num">{String(i + 1).padStart(2, "0")}</span>
                  <p className="st-ai-text">{rule}</p>
                </div>
              ))}
            </div>
          </article>

        </section>
      </div>
    </section>
  );
}
