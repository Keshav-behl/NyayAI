import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const STAGE_COLORS = {
  PENDING: 'bg-white/10 text-white/50',
  DOWNLOADED: 'bg-blue-500/20 text-blue-300',
  VALIDATED: 'bg-blue-500/20 text-blue-300',
  CHUNKED: 'bg-purple-500/20 text-purple-300',
  ENRICHED: 'bg-purple-500/20 text-purple-300',
  REVIEWED: 'bg-gold-400/20 text-gold-400',
  INGESTED: 'bg-green-500/20 text-green-400',
}

export default function AdminIngestionPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return
    api.get('/admin/ingestion-status')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load ingestion status'))
      .finally(() => setLoading(false))
  }, [user])

  if (user && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="font-heading text-2xl text-gold-400">NyayAI</span>
        <Link to="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
          Back to dashboard
        </Link>
      </header>

      <main className="px-8 py-12 max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl text-white mb-2">Legal Corpus Ingestion</h1>
        <p className="text-white/50 mb-10">MVP scope: 9 central acts. Progress reflects the live database, not a manually-updated log.</p>

        {loading && <p className="text-white/40">Loading…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {data && (
          <>
            <div className={`rounded-xl p-5 mb-10 flex items-center gap-4 border ${
              data.summary.mvpReady
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className={`w-3 h-3 rounded-full ${data.summary.mvpReady ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
              <div>
                <p className={`font-semibold text-sm ${data.summary.mvpReady ? 'text-green-400' : 'text-white'}`}>
                  {data.summary.actsIngested} / {data.summary.actsTotal} acts fully ingested
                  {data.summary.mvpReady && ' — MVP corpus ready to deploy'}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {data.summary.sectionsIngested} sections ingested
                  {data.summary.sectionsTarget != null
                    ? ` of ${data.summary.sectionsTarget} known target`
                    : ' (target unknown until Phase 8 coverage audit sets it per act)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {data.acts.map((act) => (
                <div key={act.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{act.shortTitle}, {act.year}</p>
                    <p className="text-white/40 text-xs mt-0.5">namespace: {act.namespace}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/50 text-sm">
                      {act.sectionsIngested}{act.sectionsTarget != null ? ` / ${act.sectionsTarget}` : ''} sections
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STAGE_COLORS[act.stage] || 'bg-white/10 text-white/50'}`}>
                      {act.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
