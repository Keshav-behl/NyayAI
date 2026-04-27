import { Link } from 'react-router-dom'

const TEAM = [
  { initial: 'A', name: 'Aarav Iyer', role: 'CEO · ex-Cyril Amarchand' },
  { initial: 'N', name: 'Nisha Varma', role: 'CTO · ex-Google Brain' },
  { initial: 'R', name: 'Rohan Khanna', role: 'Head of Law · ex-AZB' },
  { initial: 'S', name: 'Sanya Reddy', role: 'Head of AI Research' },
]

const TIMELINE = [
  { d: 'Mar 2024', t: 'Three co-founders — a Senior Advocate, a retrieval-systems researcher, and a former law-firm COO — meet at a dispute-resolution conference in Delhi.' },
  { d: 'Sep 2024', t: 'First closed prototype tested with 12 associates at a Tier-1 Mumbai firm. Time-to-answer on contract review queries drops from 4.2 hrs to 38 min.' },
  { d: 'Jan 2025', t: 'Seed round led by Accel, with participation from Blume Ventures and four angels from the Indian legal community. ₹28 Cr raised.' },
  { d: 'Jun 2025', t: 'Private beta opened to 14 partner firms across Bengaluru, Mumbai, Delhi, and Hyderabad. Feedback learning system goes live.' },
  { d: 'Feb 2026', t: 'Citation integrity crosses 94%. DPDP compliance audit completed. First enterprise deployment with a public sector bank.' },
  { d: 'Today', t: 'Rolling out firm-by-firm. We are deliberately going slowly — every onboarding teaches the model, and we will not compromise that.' },
]

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <span className="corner-mark tl">[ About ] § iv</span>
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="eyebrow">Our thesis</span>
              <p className="about-quote" style={{ marginTop: 40 }}>
                <span className="drop">"</span>India's legal system is the largest in the world by volume, the most pluralistic by tradition, and the most under-tooled by an order of magnitude. That is an engineering problem.<span className="drop">„</span>
              </p>
              <div style={{ marginTop: 32, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                — Founding memo · March 2024
              </div>
            </div>
            <div>
              <p className="lede">
                NyayAI exists because the tools a lawyer uses to think have barely changed since
                the database replaced the almirah. We are building the instrument that sits
                between a practitioner and the law — compressing research, grounding drafting,
                and giving every associate the reach of a partner.
              </p>
              <p className="lede" style={{ marginTop: 20 }}>
                We are not a chatbot wearing a gavel. We are a retrieval-grounded reasoning system,
                purpose-built for a jurisdiction with 1.4 billion people, 22 scheduled languages,
                and three centuries of layered jurisprudence.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                <span>न्याय</span>
                <span style={{ color: 'var(--ink-4)' }}>·</span>
                <span style={{ fontFamily: 'var(--tamil)' }}>நீதி</span>
                <span style={{ color: 'var(--ink-4)' }}>·</span>
                <span style={{ fontFamily: 'var(--bengali)' }}>ন্যায়</span>
                <span style={{ color: 'var(--ink-4)' }}>·</span>
                <span style={{ fontFamily: 'var(--urdu)', fontSize: 34 }}>انصاف</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '20px 0' }}>
        <div className="container">
          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-num">₹28 Cr</div>
              <div className="about-stat-label">Seed raised · Jan 2025</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">14</div>
              <div className="about-stat-label">Partner firms · private beta</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">38</div>
              <div className="about-stat-label">Engineers + lawyers on team</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">4</div>
              <div className="about-stat-label">Cities · Bengaluru HQ</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-head-label">
                Team
                <span className="section-head-label-num">§06</span>
              </div>
            </div>
            <div>
              <h2 className="h2">A team deliberately built at the intersection of the bar and the bench of engineering.</h2>
              <p className="lede" style={{ marginTop: 20 }}>
                Every senior hire has either practised law in an Indian firm, or built a production retrieval system at scale. We do not hire one without the other in the room.
              </p>
            </div>
          </div>
          <div className="team-row">
            {TEAM.map((p, i) => (
              <div key={i} className="team-card">
                <div className="team-avatar">{p.initial}</div>
                <div className="team-name">{p.name}</div>
                <div className="team-role">{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-head-label">
                Timeline
                <span className="section-head-label-num">§07</span>
              </div>
            </div>
            <div>
              <h2 className="h2">How we got here.</h2>
            </div>
          </div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="tl-item">
                <div className="tl-date">{t.d}</div>
                <div className="tl-text">{t.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-head-label">
                Principles
                <span className="section-head-label-num">§08</span>
              </div>
            </div>
            <div>
              <h2 className="h2">What we are unwilling to compromise.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {[
              { t: 'A lawyer is in the loop.', b: 'NyayAI drafts. NyayAI suggests. A qualified human always signs. We will not build features that route a client directly to model output for binding legal action.' },
              { t: 'Narrow and deep before broad and shallow.', b: 'We would rather be excellent at Indian commercial litigation than mediocre across every jurisdiction on earth. The platform earns width slowly.' },
              { t: 'Every number we publish is audited.', b: 'Citation integrity, time-saved, disposition accuracy — external auditors verify our marketing claims before they ship. We publish the methodology.' },
              { t: 'Consent is a first-class citizen.', b: 'Every piece of lawyer feedback that improves the model is opt-in, anonymised, and firm-scoped. No dark-pattern training pipelines. Ever.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '32px 0', borderTop: '1px solid var(--rule)' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '-0.01em', fontStyle: 'italic', marginBottom: 14, color: 'var(--ink)' }}>{p.t}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65, maxWidth: '54ch' }}>{p.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-block">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Closed beta · 14 partner firms</div>
          <h2 className="h1" style={{ margin: '24px auto 24px', maxWidth: '18ch' }}>
            Put <em className="italic gold">nyaya</em> in the hands of your practice.
          </h2>
          <p className="lede" style={{ margin: '0 auto 36px', maxWidth: '54ch' }}>
            We're rolling out firm-by-firm, with a two-week paid pilot and a senior-partner review at the end.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Request firm access <span>→</span></Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">View pricing</Link>
          </div>
        </div>
      </section>
    </>
  )
}
