import { useState } from 'react'
import { Link } from 'react-router-dom'

const PLANS = [
  {
    tier: 'Individual',
    name: 'Advocate',
    desc: 'For solo practitioners and in-chamber counsel. Everything you need to research, draft, and review — on your own terms.',
    price: 4900,
    period: 'seat / month',
    sub: 'Billed annually · ₹58,800 / yr',
    cta: 'Start free pilot',
    features: [
      { on: true, t: 'Unlimited research queries' },
      { on: true, t: 'Up to 200 contract reviews / month' },
      { on: true, t: 'Personal precedent library (50 GB)' },
      { on: true, t: 'DOCX · PDF · e-filing XML export' },
      { on: true, t: 'Email support · 48h response' },
      { on: false, t: 'Firm-scoped model tuning' },
      { on: false, t: 'Dedicated compliance workspace' },
    ],
  },
  {
    tier: 'Firm',
    name: 'Chambers',
    desc: "For growing firms that want their own voice baked into the system. Learns from your partners. Governed by your policies.",
    price: 3900,
    period: 'seat / month',
    sub: 'Min. 5 seats · billed annually',
    cta: 'Book partnership call',
    featured: true,
    features: [
      { on: true, t: 'Everything in Advocate' },
      { on: true, t: 'Firm-scoped model tuning on your precedent' },
      { on: true, t: 'Partner-preference policies (per-user)' },
      { on: true, t: 'Unlimited contract reviews' },
      { on: true, t: 'Matter-level audit trails' },
      { on: true, t: 'iManage, NetDocuments, SharePoint integrations' },
      { on: true, t: 'Dedicated Slack channel · 4h SLA' },
    ],
  },
  {
    tier: 'Enterprise',
    name: 'Counsel',
    desc: 'For banks, NBFCs, insurers, and large in-house legal teams. Compliance-first. SLA-backed. Single-tenant infrastructure.',
    price: null,
    period: 'custom',
    sub: 'Typical deployments begin at ₹24L / yr',
    cta: 'Request proposal',
    features: [
      { on: true, t: 'Everything in Chambers' },
      { on: true, t: 'Single-tenant deployment · India-only data residency' },
      { on: true, t: 'Regulatory change monitoring (RBI · SEBI · IRDAI · MCA)' },
      { on: true, t: 'SOC 2 Type II · ISO 27001 · DPDP audit artefacts' },
      { on: true, t: 'Policy-to-regulation mapping' },
      { on: true, t: 'On-premise option (air-gapped)' },
      { on: true, t: 'Named customer-success lead · 99.9% SLA' },
    ],
  },
]

const FAQS = [
  { q: "Where does our firm's data go?", a: 'Chambers and Counsel tenants run on isolated infrastructure. Your matter data never leaves your tenant boundary, is not used to train the base model, and is encrypted at rest and in transit. For Counsel, you can elect India-only data residency or full on-premise.' },
  { q: 'Does NyayAI hallucinate citations?', a: 'Every citation is grounded in a retrieval step and verified against the source judgement or statute before it reaches you. Our most recent audit (Q1 2026) puts citation integrity at 94.1%. We publish our audit methodology — not just our numbers.' },
  { q: 'What happens during the two-week pilot?', a: 'We onboard five associates from your firm, shadow their work for two weeks, and at the end deliver a time-saved analysis signed off by a senior partner. If the number is below 8 hours per associate per week, you pay nothing and walk.' },
  { q: 'How is this priced against LexisNexis / Manupatra?', a: 'We are not a research library — we are a copilot that uses research libraries. Firms typically keep their existing subscriptions and use NyayAI to reason over the results faster. Most firms find Chambers replaces about 1.5 associate-equivalents of research throughput.' },
  { q: 'Is the model Indian?', a: 'The reasoning stack runs on our own fine-tuned models, hosted in India, trained on Indian legal corpora. We do use frontier foundation models as components for non-sensitive summarisation steps — always with your tenant data stripped first.' },
  { q: 'Can we cancel?', a: 'Monthly: anytime. Annual: pro-rated refund within 60 days, no questions. After that, your annual commitment holds. We have not had an annual cancellation yet — if you become our first, we want to understand why.' },
]

function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
      {FAQS.map((f, i) => (
        <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid var(--rule)' : 'none' }}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            style={{ width: '100%', textAlign: 'left', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open === i ? 'var(--bg-2)' : 'transparent', transition: 'background 0.15s', cursor: 'pointer', border: 'none', color: 'var(--ink)', fontFamily: 'inherit' }}
          >
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.005em' }}>{f.q}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--gold)', fontStyle: 'italic', transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1, flexShrink: 0, marginLeft: 20 }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 28px 26px', fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: '68ch', animation: 'msgIn 0.25s ease' }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function PricingPage() {
  const [cycle, setCycle] = useState('annual')
  const [addons, setAddons] = useState({ translation: false, onpremise: false, training: true })

  return (
    <>
      <section className="fpage-hero">
        <span className="corner-mark tl">[ Pricing ] § iii</span>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'end' }}>
            <div>
              <span className="eyebrow">Transparent pricing · No lock-ins</span>
              <h1 className="h1" style={{ marginTop: 24, maxWidth: '16ch' }}>
                Priced for <em className="italic gold">the hour</em> a lawyer gets back.
              </h1>
            </div>
            <div>
              <p className="lede">
                Every plan includes a two-week paid pilot with a senior-partner review. If NyayAI
                doesn't save your firm at least 8 hours per associate per week, we walk.
              </p>
              <div className="price-toggle" style={{ marginTop: 28 }}>
                <button className={cycle === 'monthly' ? 'active' : ''} onClick={() => setCycle('monthly')}>Monthly</button>
                <button className={cycle === 'annual' ? 'active' : ''} onClick={() => setCycle('annual')}>
                  Annual <span className="save-badge">SAVE 20%</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <div className="price-grid">
            {PLANS.map((p, i) => {
              const displayPrice = p.price ? (cycle === 'annual' ? p.price : Math.round(p.price * 1.25)) : null
              return (
                <div key={i} className={`price-card ${p.featured ? 'featured' : ''}`}>
                  <div className="price-tier">{p.tier}</div>
                  <div className="price-name">{p.name}</div>
                  <div className="price-desc">{p.desc}</div>
                  {displayPrice ? (
                    <div className="price-amount">
                      <span className="price-currency">₹</span>
                      <span className="price-num">{displayPrice.toLocaleString('en-IN')}</span>
                      <span className="price-period">/ {p.period}</span>
                    </div>
                  ) : (
                    <div className="price-amount">
                      <span className="price-num" style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Custom</span>
                    </div>
                  )}
                  <div className="price-sub">{p.sub}</div>
                  <Link to="/register" className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} price-btn`} style={{ textAlign: 'center' }}>{p.cta}</Link>
                  <div className="price-list">
                    {p.features.map((f, fi) => (
                      <div key={fi} className={`price-item ${!f.on ? 'muted' : ''}`}>{f.t}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-head-label">
                Add-ons
                <span className="section-head-label-num">§04</span>
              </div>
            </div>
            <div>
              <h2 className="h2">Capabilities you can layer onto any plan.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
            {[
              { key: 'translation', name: 'Multi-lingual Drafting', p: '₹1,200 / seat', desc: 'Draft & translate into Hindi, Tamil, Bengali, Telugu, Marathi, Kannada, Gujarati, Punjabi, Urdu, Malayalam, Odia.' },
              { key: 'onpremise', name: 'On-premise Deployment', p: '₹18L setup', desc: 'Air-gapped, your hardware, your network. For matters that cannot leave your perimeter.' },
              { key: 'training', name: 'Partner Onboarding', p: '₹2.4L one-time', desc: 'Two-day on-site training for partners and senior associates. Includes custom policy authoring.' },
            ].map(a => (
              <div
                key={a.key}
                style={{ background: addons[a.key] ? 'var(--bg-2)' : 'var(--bg)', padding: '32px 28px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', flexDirection: 'column' }}
                onClick={() => setAddons(s => ({ ...s, [a.key]: !s[a.key] }))}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ width: 22, height: 22, border: '1px solid var(--rule)', borderRadius: 2, display: 'grid', placeItems: 'center', background: addons[a.key] ? 'var(--ink)' : 'transparent', flexShrink: 0 }}>
                    {addons[a.key] && <span style={{ color: 'var(--bg)', fontSize: 14, lineHeight: 0 }}>✓</span>}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.12em' }}>{a.p}</span>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', marginBottom: 8 }}>{a.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>{a.desc}</div>
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
                FAQ
                <span className="section-head-label-num">§05</span>
              </div>
            </div>
            <div>
              <h2 className="h2">The questions partners actually ask us.</h2>
            </div>
          </div>
          <FAQ />
        </div>
      </section>
    </>
  )
}
