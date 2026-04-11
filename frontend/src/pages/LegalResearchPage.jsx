import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const SAMPLE_QUESTIONS = [
  'Can police arrest without a warrant?',
  'What are my rights if I am arrested?',
  'How do I file an FIR?',
  'What constitutes a valid contract in India?',
  'What is anticipatory bail?',
  'How to file a consumer complaint?',
  'What is the punishment for cheating under IPC?',
  'How to apply for RTI?',
]

function SourceCard({ source }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{source.act} — Section {source.section}</p>
        <p className="text-white/50 text-xs mt-0.5">{source.title}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-saffron-500 rounded-full"
            style={{ width: `${source.relevanceScore}%` }}
          />
        </div>
        <span className="text-white/40 text-xs">{source.relevanceScore}%</span>
      </div>
    </div>
  )
}

export default function LegalResearchPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const handleAsk = async (q) => {
    const query = q || question
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.post('/legal/ask', { question: query })
      const data = res.data.data
      setResult(data)
      setHistory(h => [{ question: query, answer: data.answer, sources: data.sources }, ...h.slice(0, 4)])
      setQuestion('')
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/lawyers" className="text-white/50 hover:text-white text-sm transition-colors">Lawyers</Link>
          <Link to="/documents" className="text-white/50 hover:text-white text-sm transition-colors">Documents</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-saffron-500/10 border border-saffron-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-saffron-500 text-sm">🤖 Powered by Claude AI + Indian Law Database</span>
          </div>
          <h1 className="font-heading text-4xl text-white mb-3">Legal Research</h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Ask any question about Indian law — IPC, CrPC, Contract Act, Consumer Protection, RTI and more.
          </p>
        </div>

        {/* Search Box */}
        <div className="card mb-6">
          <div className="flex gap-3">
            <textarea
              className="input flex-1 min-h-16 resize-none"
              placeholder="e.g. Can police arrest without warrant? What are bail rights? How to file FIR?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="btn-primary px-6 self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </div>
          <p className="text-white/20 text-xs mt-2">Press Enter to search</p>
        </div>

        {/* Sample Questions */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-white/40 text-sm mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-saffron-500/20 flex items-center justify-center">
                <span className="text-saffron-500 text-sm">⚖️</span>
              </div>
              <p className="text-white/70 text-sm">Searching Indian law database...</p>
            </div>
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-5/6" />
              <div className="h-3 bg-white/10 rounded w-4/6" />
              <div className="h-3 bg-white/5 rounded w-3/4 mt-4" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4 mb-8">
            {/* Question */}
            <div className="flex justify-end">
              <div className="bg-saffron-500/10 border border-saffron-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg">
                <p className="text-white text-sm">{result.question}</p>
              </div>
            </div>

            {/* Answer */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-saffron-500/20 flex items-center justify-center">
                  <span className="text-saffron-500 text-xs">⚖️</span>
                </div>
                <span className="text-white/50 text-sm">NyayAI</span>
              </div>
              <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {result.answer}
              </div>

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Sources</p>
                  <div className="space-y-2">
                    {result.sources.map((source, i) => (
                      <SourceCard key={i} source={source} />
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-white/30 text-xs">
                  ⚠️ This is for informational purposes only. For specific legal advice, consult a qualified lawyer.
                </p>
              </div>
            </div>

            {/* Ask another */}
            <button
              onClick={() => { setResult(null); setQuestion('') }}
              className="btn-secondary text-sm px-4 py-2 w-full"
            >
              Ask another question
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Previous questions</p>
            <div className="space-y-2">
              {history.slice(1).map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(item.question)}
                  className="w-full text-left bg-white/3 hover:bg-white/5 border border-white/5 rounded-lg px-4 py-3 transition-colors"
                >
                  <p className="text-white/60 text-sm truncate">{item.question}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}