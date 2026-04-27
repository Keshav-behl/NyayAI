import { Link } from 'react-router-dom'

const BIG_FEATURES = [
  {
    label: '§01 · Research',
    title: 'A research assistant that reasons in Indian case law.',
    body: 'Ask in plain English. NyayAI returns a structured brief: issues framed, authorities ranked by relevance and recency, dissents flagged, and the procedural posture of every cited case made explicit.',
    checks: [
      'Grounded on 2.4M+ Indian judgments — SC, HC, tribunals, NCLT, NCLAT, ITAT',
      'Statute-level reasoning across Constitution, Codes, DPDP, IBC, Arbitration Act',
      'Citation integrity audited at 94% — provenance verified on every claim',
      'Parallel-citation resolution (SCC, AIR, SCR, Manu) handled automatically',
    ],
    vis: 'research',
  },
  {
    label: '§02 · Drafting',
    title: "Drafting that respects your firm's voice.",
    body: "Petitions, notices, agreements, opinions — generated from your firm's standard library, preserving partner preferences, jurisdictional conventions, and the specific shape of how your practice drafts.",
    checks: [
      'Firm-scoped precedent library — your drafts shape the model',
      'Inline redline generation with reasoning for every edit',
      'Clause-level version history with authorial attribution',
      "Export to DOCX, PDF, or the courts' e-filing XML where applicable",
    ],
    vis: 'draft',
  },
  {
    label: '§03 · Contract Intelligence',
    title: 'Contract review that reads for what matters.',
    body: "Upload an MSA, NDA, SPA, employment contract, lease. NyayAI surfaces risks with the specificity a senior associate would — not a checklist, but a judgement, with the negotiation posture you'd take to the partner.",
    checks: [
      'Clause-by-clause risk scoring with P0/P1/P2 prioritisation',
      'Market-comparable benchmarking across 400K+ reviewed agreements',
      'DPDP, FEMA, SEBI, Competition Act compliance checkpoints',
      'Negotiation brief auto-generated — positions, fallbacks, red lines',
    ],
    vis: 'contract',
  },
  {
    label: '§04 · Case Strategy',
    title: 'Strategic reasoning, not just answers.',
    body: 'For a live matter, NyayAI drafts a strategy memo: likely defences, procedural choices, forum selection, interim-relief windows, precedent risks. It thinks like a litigator thinks — tradeoffs, not outputs.',
    checks: [
      'Forum-selection modelling with historical disposition rates',
      'Limitation calculator across all civil and commercial statutes',
      "Opposing-counsel prep — patterns from public orders they've argued",
      'Timeline reconstruction from pleadings and exhibits',
    ],
    vis: 'strategy',
  },
  {
    label: '§05 · Enterprise Copilot',
    title: 'For banks, NBFCs, and in-house legal — the compliance layer.',
    body: 'Not a chatbot bolted to your workflow. A compliance spine: regulatory change tracking, policy alignment, audit-grade outputs, integrations with your DMS and contract lifecycle stack.',
    checks: [
      'RBI, SEBI, IRDAI, MCA regulatory change monitoring in real-time',
      'Policy-to-regulation mapping with gap analysis',
      'ISO 27001 · SOC 2 Type II · DPDP Act Section 11 compliant',
      'iManage, NetDocuments, SharePoint, Microsoft 365 integrations',
    ],
    vis: 'compliance',
  },
]

function ResearchVis() {
  return (
    <div className="doc-card">
      <div className="doc-head">
        <span>BRIEF · Q-2847</span>
        <span>6 authorities · verified</span>
      </div>
      <div style={{ color: 'var(--gold)', marginBottom: 8, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Issue Framed</div>
      <div>Whether a <span className="doc-annotation">liability cap of 3 months' fees</span> is enforceable against an Indian party in a cross-border SaaS agreement.</div>
      <div style={{ color: 'var(--gold)', margin: '18px 0 8px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Authorities, ranked</div>
      <div style={{ display: 'grid', gap: 6 }}>
        <div><span style={{ color: 'var(--ink-4)' }}>[1]</span> <span className="doc-annotation">Modi Entertainment Ltd. v. WSG Cricket (2003)</span> · 4 SCC 341</div>
        <div><span style={{ color: 'var(--ink-4)' }}>[2]</span> ONGC v. Saw Pipes (2003) · 5 SCC 705</div>
        <div><span style={{ color: 'var(--ink-4)' }}>[3]</span> Renusagar Power v. General Electric (1994) · AIR SC 860</div>
        <div><span style={{ color: 'var(--ink-4)' }}>[4]</span> Indian Contract Act, §73 · §74</div>
      </div>
      <div style={{ color: 'var(--gold)', margin: '18px 0 8px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Conclusion</div>
      <div>Enforceable in principle, but the cap is likely to be read down if it amounts to <span className="doc-annotation">contracting out of §73</span> remedies. Recommend re-negotiation.</div>
    </div>
  )
}

function DraftVis() {
  return (
    <div className="doc-card" style={{ fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.7 }}>
      <div className="doc-head" style={{ fontFamily: 'var(--mono)' }}>
        <span>PETITION · RERA-2026-0881</span>
        <span>Draft · v3</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12, letterSpacing: '0.02em' }}>
        IN THE KARNATAKA REAL ESTATE<br />REGULATORY AUTHORITY, BENGALURU
      </div>
      <div style={{ borderTop: '1px dashed var(--rule)', borderBottom: '1px dashed var(--rule)', padding: '10px 0', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 14 }}>
        COMPLAINT NO. ___ / 2026
      </div>
      <div>In the matter of:</div>
      <div style={{ margin: '8px 0' }}>Shri <span className="doc-annotation">[Complainant Name]</span>, s/o <span className="doc-annotation">[Father's Name]</span>, r/o Flat 4B, Prestige Acropolis, Koramangala.</div>
      <div style={{ textAlign: 'right', color: 'var(--ink-3)' }}>...Complainant</div>
      <div style={{ margin: '8px 0' }}>v.</div>
      <div><span className="doc-annotation">Shelter Developers Pvt. Ltd.</span>, a company registered under the Companies Act, 2013...</div>
      <div style={{ textAlign: 'right', color: 'var(--ink-3)' }}>...Respondent</div>
      <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.14em' }}>
        ✓ FACTUAL MATRIX · AUTO-DRAFTED FROM UPLOADED AGREEMENT
      </div>
    </div>
  )
}

function ContractVis() {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 16 }}>
        MSA · ACME INDIA × CLOUDCO · 42 PAGES · 38 CLAUSES SCANNED
      </div>
      <div style={{ border: '1px solid var(--rule)', borderRadius: 3 }}>
        <div className="compliance-row"><span>§12.4 Limitation of Liability — cap at 3 mo. fees</span><span className="risk-dot risk" /><span className="compliance-status risk">P0</span></div>
        <div className="compliance-row"><span>§18.1 Governing Law — exclusive Delaware seat</span><span className="risk-dot risk" /><span className="compliance-status risk">P0</span></div>
        <div className="compliance-row"><span>§7.3 Data Processing — no DPDP reference</span><span className="risk-dot warn" /><span className="compliance-status warn">P1</span></div>
        <div className="compliance-row"><span>§22 Termination — no transition assistance</span><span className="risk-dot warn" /><span className="compliance-status warn">P1</span></div>
        <div className="compliance-row"><span>§14 Indemnification — mutual, commercially standard</span><span className="risk-dot ok" /><span className="compliance-status ok">OK</span></div>
        <div className="compliance-row"><span>§3.2 Fees — escalator tied to US CPI, not Indian</span><span className="risk-dot warn" /><span className="compliance-status warn">P2</span></div>
      </div>
      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', border: '1px solid var(--gold-dim)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.65 }}>
        <div style={{ color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.14em' }}>NEGOTIATION POSTURE</div>
        Open by anchoring at 24mo cap → settle at 12mo. Concede §3.2 escalator<br />
        Non-negotiable: §18.1 (jurisdiction) and §7.3 (DPDP).
      </div>
    </div>
  )
}

function StrategyVis() {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 16 }}>
        MATTER · SHARMA v. HUDA · FORUM ANALYSIS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { forum: 'RERA', dispo: '62%', time: '4-6 mo', cost: '₹2.5L', rec: true },
          { forum: 'Civil Court', dispo: '41%', time: '3-5 yr', cost: '₹8L+', rec: false },
          { forum: 'NCDRC', dispo: '54%', time: '18-24 mo', cost: '₹4L', rec: false },
          { forum: 'IBC Trigger', dispo: '—', time: '6-9 mo', cost: '₹12L', rec: false },
        ].map((f, i) => (
          <div key={i} style={{ padding: 14, background: 'var(--bg)', border: f.rec ? '1px solid var(--gold-dim)' : '1px solid var(--rule)', borderRadius: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: f.rec ? 'var(--gold)' : 'var(--ink)' }}>{f.forum}</span>
              {f.rec && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.15em' }}>RECOMMENDED</span>}
            </div>
            <div style={{ display: 'grid', gap: 4, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Disposition</span><span style={{ color: 'var(--ink-2)' }}>{f.dispo}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Timeline</span><span style={{ color: 'var(--ink-2)' }}>{f.time}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Est. Cost</span><span style={{ color: 'var(--ink-2)' }}>{f.cost}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
        Based on 4,812 comparable matters decided 2020–2026.
      </div>
    </div>
  )
}

function ComplianceVis() {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 16 }}>
        REGULATORY WATCH · BANK · 7 DAYS
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {[
          { d: 'APR 17', src: 'RBI', t: 'Master Direction — KYC (Amendment), 2026', sev: 'high' },
          { d: 'APR 15', src: 'SEBI', t: 'Circular on REIT disclosure norms', sev: 'med' },
          { d: 'APR 12', src: 'MCA', t: "Companies (Auditor's Report) Amendment Rules", sev: 'med' },
          { d: 'APR 09', src: 'MeitY', t: 'DPDP Rules — draft consultation paper', sev: 'high' },
          { d: 'APR 05', src: 'IRDAI', t: 'Circular on bancassurance commissions', sev: 'low' },
        ].map((u, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 50px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 3 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em' }}>{u.d}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.14em' }}>{u.src}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{u.t}</span>
            <span className="risk-dot" style={{ background: u.sev === 'high' ? '#e28a7a' : u.sev === 'med' ? 'var(--gold)' : '#9fd68f' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

const VIS_MAP = { research: ResearchVis, draft: DraftVis, contract: ContractVis, strategy: StrategyVis, compliance: ComplianceVis }

export default function FeaturesPage() {
  return (
    <>
      <section className="fpage-hero">
        <span className="corner-mark tl">[ Features ] § ii</span>
        <div className="container">
          <div style={{ maxWidth: '22ch', marginBottom: 28 }}>
            <span className="eyebrow">The system in detail</span>
          </div>
          <h1 className="h1" style={{ maxWidth: '20ch' }}>
            Five capabilities. <em className="italic gold">One</em> reasoning engine underneath.
          </h1>
          <p className="lede" style={{ marginTop: 28 }}>
            Research, drafting, contract review, litigation strategy, and enterprise compliance are not
            separate products — they are different shapes the same grounded-reasoning engine takes when
            pointed at different work.
          </p>
        </div>
      </section>

      <div className="container">
        {BIG_FEATURES.map((f, i) => {
          const Vis = VIS_MAP[f.vis]
          return (
            <div key={i} className="fpage-big">
              <div>
                <div className="fpage-big-label">{f.label}</div>
                <div className="fpage-big-title">{f.title}</div>
                <div className="fpage-big-body">{f.body}</div>
                <div className="fpage-checks">
                  {f.checks.map((c, ci) => (
                    <div key={ci} className="fpage-check">
                      <span className="fpage-check-mark">§</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fpage-vis"><Vis /></div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <section className="cta-block">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Closed beta · 14 partner firms</div>
          <h2 className="h1" style={{ margin: '24px auto 24px', maxWidth: '18ch' }}>
            Put <em className="italic gold">nyaya</em> in the hands of your practice.
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Request firm access <span>→</span></Link>
            <Link to="/about" className="btn btn-ghost btn-lg">Read the research note</Link>
          </div>
        </div>
      </section>
    </>
  )
}
