import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const INDIAN_LANGS = [
  { word: 'न्याय', note: 'Nyāya — Hindi' },
  { word: 'நீதி', note: 'Nīti — Tamil' },
  { word: 'ন্যায়', note: 'Nyāẏa — Bengali' },
  { word: 'న్యాయం', note: 'Nyāyaṁ — Telugu' },
  { word: 'ਨਿਆਂ', note: 'Niā̃ — Punjabi' },
  { word: 'ન્યાય', note: 'Nyāy — Gujarati' },
  { word: 'ನ್ಯಾಯ', note: 'Nyāya — Kannada' },
  { word: 'നീതി', note: 'Nīti — Malayalam' },
  { word: 'न्याय', note: 'Nyāya — Marathi' },
  { word: 'انصاف', note: 'Insāf — Urdu' },
  { word: 'ନ୍ୟାୟ', note: 'Nyāẏa — Odia' },
  { word: 'Justice', note: 'English' },
]

const PROMPTS = [
  {
    q: "Employer withheld two months' salary — what are my options?",
    stream: [
      { type: 'p', text: "Under the Payment of Wages Act, 1936 (for wages ≤ ₹24,000/month) or Section 15 of the Industrial Disputes Act, 1947, withholding wages without legal authorisation is actionable." },
      { type: 'p', text: "You have three escalating remedies, ordered by speed and cost:" },
      { type: 'steps', items: [
        { k: 'Step 1', v: 'Written demand notice to employer, giving 15 days to pay. Keep proof of delivery.' },
        { k: 'Step 2', v: 'File a complaint with the Labour Commissioner (free). Average resolution: 45–90 days.' },
        { k: 'Step 3', v: 'If unresolved, approach the Labour Court under Sec. 33C(2), I.D. Act for recovery.' },
      ]},
      { type: 'p', text: "Precedent favours employees — see Haryana Urban Dev. Authority v. Shakuntla Devi (2004) on recovery of withheld wages with interest.", cites: ['§15 ID Act', 'HUDA v. Shakuntla'] },
    ],
    actions: ['Draft demand notice', 'Find Labour Commissioner (Bengaluru)', 'Calculate interest payable', 'Prepare case timeline'],
  },
  {
    q: "Review this SaaS MSA for risk — 40-page agreement.",
    stream: [
      { type: 'p', text: "Completed — scanned 38 clauses, flagged 6 risk items. Two are P0 for Indian jurisdiction." },
      { type: 'risks', items: [
        { level: 'risk', clause: '§12.4 Liability', note: 'Cap set at fees paid in last 3 months. Market standard is 12 months. Recommend renegotiating.' },
        { level: 'risk', clause: '§18.1 Jurisdiction', note: 'Exclusive seat in Delaware — unenforceable for Indian party under Modi Entertainment Ltd. (2003). Recommend neutral seat (Singapore) or Indian arbitration.' },
        { level: 'warn', clause: '§7.3 Data Processing', note: 'Does not reference DPDP Act, 2023 obligations. Missing: cross-border transfer mechanism, breach notification SLA.' },
        { level: 'warn', clause: '§22 Termination', note: 'No transition assistance clause. Recommend 90-day wind-down.' },
      ]},
      { type: 'p', text: "I've generated redlines and a negotiation brief — open the document workspace to review.", cites: ['DPDP Act §11', 'Modi Ent. (2003)'] },
    ],
    actions: ['Open redline document', 'Generate negotiation brief', 'Export risk summary (PDF)', 'Schedule review with senior'],
  },
  {
    q: "File a consumer complaint against a builder for delayed possession.",
    stream: [
      { type: 'p', text: "This falls under the Real Estate (Regulation and Development) Act, 2016 (RERA) — the stronger forum for homebuyers. You have parallel remedies under the Consumer Protection Act, 2019." },
      { type: 'steps', items: [
        { k: 'Forum', v: 'State RERA Authority (faster, builder-specific) or NCDRC if claim > ₹2 Cr.' },
        { k: 'Limitation', v: '3 years from possession-date default. Your matter is within limitation.' },
        { k: 'Relief', v: 'Refund with interest (SBI MCLR + 2%), or possession with delay compensation.' },
      ]},
      { type: 'p', text: "Pioneer Urban Land v. Govindan (2019, SC) is the leading case — homebuyers are 'financial creditors' and can also trigger IBC. I'll prepare the RERA petition shell.", cites: ['RERA §18', 'Pioneer Urban (2019)'] },
    ],
    actions: ['Draft RERA petition', 'Calculate interest (SBI MCLR)', 'Check builder RERA status', 'Estimate recovery timeline'],
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Ask — or upload the problem in its raw form.',
    body: 'Natural-language queries, a contract PDF, a voice note from a client, a brief scanned from the court. NyayAI normalises the input, identifies the legal surface area, and routes to the right reasoning pipeline.',
    preview: [
      { tag: '→ INPUT', val: 'Contract.pdf · 42 pages · executed 2024-11-08' },
      { tag: '→ PARSED', val: 'Master Services Agreement / SaaS / Cross-border' },
      { tag: '→ ROUTE', val: 'contract.review + compliance.dpdp + jurisdiction.enforcement' },
      { tag: '→ POLICY', val: 'firm_standard.v12 · partner_preferences[raj.mehta]' },
    ],
  },
  {
    num: '02',
    title: 'Retrieve from a living corpus of Indian law.',
    body: "Our RAG engine pulls from statutes, subordinate legislation, Supreme Court + High Court judgments, tribunal rulings, and — for enterprise tenants — the firm's internal precedent. Every fact traces back to a source.",
    preview: [
      { tag: '→ SEARCH', val: '"liability cap" AND "SaaS" AND jurisdiction:IN' },
      { tag: '→ MATCHES', val: '38 statutes · 214 judgments · 1,904 contract clauses' },
      { tag: '→ RANKED', val: 'Pioneer Urban (2019) · Modi Ent. (2003) · DPDP Act 2023 §11' },
      { tag: '→ GROUND', val: '6 citations passed provenance + freshness check' },
    ],
  },
  {
    num: '03',
    title: 'Reason — with structure, confidence bands, and defensible output.',
    body: 'Output is never a flat paragraph. It is a structured answer: issues framed, authorities cited, remedies ranked by speed & cost, drafts generated inline. Every claim is hoverable — one click opens the source.',
    preview: [
      { tag: '→ ISSUES', val: '[3] identified · 2 material · 1 ancillary' },
      { tag: '→ REMEDIES', val: 'RERA petition (primary) · Consumer forum (alt) · IBC (strategic)' },
      { tag: '→ DRAFT', val: 'RERA Form A populated · ready for partner review' },
      { tag: '→ AUDIT', val: 'All outputs logged · citation integrity 100%' },
    ],
  },
  {
    num: '04',
    title: 'Learn — from every lawyer edit.',
    body: 'When a senior partner rewrites a clause, overrides a citation, or flags a hallucination, NyayAI captures the delta (anonymised, consented, firm-scoped). This feedback loop is why the platform gets sharper every quarter.',
    preview: [
      { tag: '→ EDITS', val: '187 captured this week · 94% clause-level' },
      { tag: '→ OVERRIDES', val: '12 citation substitutions · 3 model-level corrections' },
      { tag: '→ APPLIED', val: 'Policy updates scheduled for 2026.Q2 release' },
      { tag: '→ PRIVACY', val: 'PII stripped at write · firm tenant isolation · DPDP-compliant' },
    ],
  },
]

function Cursor() {
  return <span className="cursor" />
}

function ChatDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [stage, setStage] = useState('idle')
  const [streamCount, setStreamCount] = useState(0)
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)

  const active = PROMPTS[activeIdx]

  const runPrompt = (idx) => {
    setActiveIdx(idx)
    setStage('typing')
    setStreamCount(0)
  }

  useEffect(() => {
    if (stage === 'typing') {
      const t = setTimeout(() => setStage('streaming'), 900)
      return () => clearTimeout(t)
    }
    if (stage === 'streaming') {
      if (streamCount < active.stream.length) {
        const t = setTimeout(() => setStreamCount(c => c + 1), 420)
        return () => clearTimeout(t)
      } else {
        setStage('done')
      }
    }
  }, [stage, streamCount, activeIdx])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [streamCount, stage])

  useEffect(() => {
    const t = setTimeout(() => runPrompt(0), 600)
    return () => clearTimeout(t)
  }, [])

  const showingUser = stage !== 'idle'
  const shown = active.stream.slice(0, streamCount)

  return (
    <div>
      <div className="chat-card">
        <div className="chat-head">
          <div className="chat-head-left">
            <span className="chat-dot" />
            <span>NYAYAI · LEGAL COPILOT</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.15em' }}>
            <span>RAG · INDIAN LAW CORPUS</span>
            <span>v 0.9</span>
          </div>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {showingUser && (
            <div className="msg msg-user" key={`u-${activeIdx}`}>{active.q}</div>
          )}
          {stage === 'typing' && (
            <div className="msg msg-ai" key={`t-${activeIdx}`}>
              <div className="msg-ai-role">
                <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%' }} />
                <span>NyayAI · reasoning</span>
              </div>
              <div className="typing"><span /><span /><span /></div>
            </div>
          )}
          {(stage === 'streaming' || stage === 'done') && (
            <div className="msg msg-ai" key={`a-${activeIdx}`}>
              <div className="msg-ai-role">
                <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%' }} />
                <span>NyayAI</span>
                <span style={{ color: 'var(--ink-4)', marginLeft: 8 }}>· grounded response</span>
              </div>
              <div className="msg-ai-body">
                {shown.map((b, i) => {
                  const isLast = i === shown.length - 1 && stage === 'streaming'
                  if (b.type === 'p') {
                    return (
                      <p key={i}>
                        {b.text}
                        {b.cites && b.cites.map((c, ci) => <span key={ci} className="cite">{c}</span>)}
                        {isLast && <Cursor />}
                      </p>
                    )
                  }
                  if (b.type === 'steps') {
                    return (
                      <div key={i} style={{ display: 'grid', gap: 8, margin: '10px 0', padding: '12px 14px', border: '1px solid var(--rule)', borderRadius: 3, background: 'var(--bg)' }}>
                        {b.items.map((s, si) => (
                          <div key={si} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'start' }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--gold)', textTransform: 'uppercase', marginTop: 3 }}>{s.k}</span>
                            <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{s.v}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  if (b.type === 'risks') {
                    return (
                      <div key={i} style={{ border: '1px solid var(--rule)', borderRadius: 3, background: 'var(--bg)', margin: '10px 0' }}>
                        {b.items.map((r, ri) => (
                          <div key={ri} className="compliance-row" style={{ fontSize: 12.5 }}>
                            <div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{r.clause}</div>
                              <div style={{ color: 'var(--ink-2)', marginTop: 4 }}>{r.note}</div>
                            </div>
                            <span className="risk-dot" style={{ background: r.level === 'risk' ? '#e28a7a' : r.level === 'warn' ? 'var(--gold)' : '#9fd68f' }} />
                            <span className={`compliance-status ${r.level}`}>{r.level === 'risk' ? 'P0' : r.level === 'warn' ? 'P1' : 'OK'}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
              {stage === 'done' && (
                <div className="msg-ai-actions">
                  {active.actions.map((a, i) => (
                    <button key={i} className="chip">{a}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="chat-foot">
          <input
            className="chat-input"
            placeholder="Ask anything — a statute, a case, upload a contract..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { runPrompt(0); setInput('') } }}
          />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em' }}>⌘ K</span>
          <button className="chat-send" onClick={() => runPrompt(0)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 7h10M7 2l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-prompts">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', textTransform: 'uppercase', alignSelf: 'center', marginRight: 4 }}>Try:</span>
        {PROMPTS.map((p, i) => (
          <button key={i} className="prompt-chip" onClick={() => runPrompt(i)}>
            {p.q.length > 52 ? p.q.slice(0, 50) + '…' : p.q}
          </button>
        ))}
      </div>
    </div>
  )
}

function RotatingJustice() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % INDIAN_LANGS.length), 1800)
    return () => clearInterval(t)
  }, [])
  const cur = INDIAN_LANGS[idx]
  const fontFamily = cur.note.includes('Tamil') ? 'var(--tamil)'
    : cur.note.includes('Bengali') ? 'var(--bengali)'
    : cur.note.includes('Urdu') ? 'var(--urdu)'
    : cur.note === 'English' ? 'var(--serif)'
    : 'var(--deva)'
  return (
    <span className="hero-rotator">
      <span className="hero-rotator-inner" key={idx} style={{ fontFamily }}>{cur.word}</span>
    </span>
  )
}

function LangRibbon() {
  const doubled = [...INDIAN_LANGS, ...INDIAN_LANGS]
  return (
    <div className="lang-ribbon">
      <div className="lang-ribbon-track">
        {doubled.map((l, i) => (
          <span key={i} className="lang-word">
            <span>{l.word}</span>
            <span className="mono">{l.note}</span>
            <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: 12 }}>—</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function HowItWorks() {
  const [active, setActive] = useState(0)
  return (
    <section className="section">
      <span className="corner-mark tl">[ 02 ] Method</span>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-head-label">
              How it works
              <span className="section-head-label-num">§02</span>
            </div>
          </div>
          <div>
            <h2 className="h2">Four movements, from ambiguous legal problem to defensible action.</h2>
            <p className="lede" style={{ marginTop: 20 }}>
              Every NyayAI answer is grounded, cited, and auditable. Click any step to expand the trace.
            </p>
          </div>
        </div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`step ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>
              <div className="step-num">{s.num}</div>
              <div>
                <div className="step-title">{s.title}</div>
              </div>
              <div>
                <div className="step-body">{s.body}</div>
                <div className="step-preview">
                  {s.preview.map((p, pi) => (
                    <div key={pi}><span className="tag">{p.tag}</span> <span className="muted">—</span> {p.val}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Tenets() {
  const tenets = [
    { n: '01', t: 'Every answer carries its citations.', b: "No unsourced claim, ever. Hover any sentence to see the statute, case, or clause it rests on." },
    { n: '02', t: 'Built for Indian law, not adapted to it.', b: "Common law muscle memory doesn't transfer. Our reasoning is trained on the Constitution, the Codes, and decades of SC & HC jurisprudence." },
    { n: '03', t: 'Lawyer edits are the teacher.', b: 'Every override, every redline, every reject — captured with consent, applied to the model. A compounding data moat.' },
    { n: '04', t: 'Privacy is a primitive, not a feature.', b: "Tenant isolation. PII stripping at write. DPDP-compliant. Your matter data never leaves your firm's boundary." },
  ]
  return (
    <section className="section" style={{ paddingBottom: 40 }}>
      <span className="corner-mark tl">[ 03 ] Principles</span>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-head-label">
              Tenets
              <span className="section-head-label-num">§03</span>
            </div>
          </div>
          <div>
            <h2 className="h2">Four non-negotiables we built the system around.</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
          {tenets.map((t, i) => (
            <div key={i} style={{ background: 'var(--bg)', padding: '40px 36px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: 18 }}>{t.n}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 12 }}>{t.t}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: '52ch' }}>{t.b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="cta-block">
      <div className="container">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>Closed beta · 14 partner firms</div>
        <h2 className="h1" style={{ margin: '24px auto 24px', maxWidth: '18ch' }}>
          Put <em className="italic gold">nyaya</em> in the hands of your practice.
        </h2>
        <p className="lede" style={{ margin: '0 auto 36px', maxWidth: '54ch' }}>
          We're rolling out firm-by-firm, with a two-week paid pilot and a senior-partner review at the end.
          If it doesn't save you 8+ hours per associate per week, you walk.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Request firm access <span>→</span>
          </Link>
          <Link to="/about" className="btn btn-ghost btn-lg">Read the research note</Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="brand">
              <div className="brand-mark"><span style={{ fontStyle: 'italic' }}>N</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="brand-word">NyayAI</span>
                <span className="brand-sub">Legal Intelligence</span>
              </div>
            </Link>
            <div className="nav-links">
              <Link to="/features" className="nav-link">Features</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/about" className="nav-link">About</Link>
              <div className="nav-cta">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-ghost">Sign in</Link>
                    <Link to="/register" className="btn btn-primary">
                      Request access <span style={{ fontSize: 14 }}>→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section className="hero">
          <span className="corner-mark tl">[ 01 ] Landing</span>
          <span className="corner-mark tr">Private beta · Reg. no. BLR-2026-0091</span>
          <div className="container">
            <div className="hero-grid">
              <div>
                <span className="eyebrow">Legal Intelligence · Made in India</span>
                <h1 className="h-display hero-headline">
                  <span>The AI behind</span><br />
                  <em><RotatingJustice /></em><br />
                  <span>in modern India.</span>
                </h1>
                <p className="lede">
                  NyayAI is a retrieval-grounded legal copilot trained on Indian statutes, precedent, and the
                  working patterns of practising lawyers. It turns complex legal problems into structured,
                  citable, defensible answers — at the pace your practice runs.
                </p>
                <div className="hero-cta">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Request firm access <span style={{ fontSize: 14 }}>→</span>
                  </Link>
                  <button className="btn btn-gold btn-lg">Watch the 90-second demo</button>
                </div>
                <div className="hero-meta">
                  <div>
                    <div className="hero-stat-num">2.4M<span className="gold italic">+</span></div>
                    <div className="hero-stat-label">Indian judgments indexed</div>
                  </div>
                  <div>
                    <div className="hero-stat-num">1,187</div>
                    <div className="hero-stat-label">Statutes & amendments</div>
                  </div>
                  <div>
                    <div className="hero-stat-num">94<span className="ink-3">%</span></div>
                    <div className="hero-stat-label">Citation accuracy, audited</div>
                  </div>
                </div>
              </div>
              <div>
                <ChatDemo />
              </div>
            </div>
          </div>
        </section>

        <LangRibbon />
        <HowItWorks />
        <Tenets />
        <CTA />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="brand">
                <div className="brand-mark"><span style={{ fontStyle: 'italic' }}>N</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="brand-word">NyayAI</span>
                  <span className="brand-sub">Legal Intelligence</span>
                </div>
              </Link>
              <p className="footer-brand-p">
                India's legal operating system. Built on retrieval-grounded reasoning over statutes, case law, and practitioner workflows.
              </p>
              <div className="footer-langs" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                <span>न्याय</span>
                <span style={{ fontFamily: 'var(--tamil)' }}>நீதி</span>
                <span style={{ fontFamily: 'var(--bengali)' }}>ন্যায়</span>
                <span style={{ fontFamily: 'var(--urdu)' }}>انصاف</span>
              </div>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <a href="#">Changelog</a>
              <a href="#">API Docs</a>
              <a href="#">Status</a>
            </div>
            <div className="footer-col">
              <h4>Practice</h4>
              <a href="#">Research</a>
              <a href="#">Drafting</a>
              <a href="#">Compliance</a>
              <a href="#">Case Strategy</a>
              <a href="#">Litigation</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <a href="#">Research Notes</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy</a>
              <a href="#">Data Handling</a>
              <a href="#">Bar Compliance</a>
              <a href="#">Responsible AI</a>
            </div>
          </div>
          <div className="footer-word">NyayAI</div>
          <div className="footer-bottom">
            <span>© 2026 NyayAI Technologies Pvt. Ltd. · Incorporated in Bengaluru</span>
            <span>v 0.9.2 · Private beta</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
