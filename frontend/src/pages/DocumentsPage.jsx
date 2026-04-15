import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const CATEGORIES = [
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'COURT_ORDER', label: 'Court Order' },
  { value: 'FIR', label: 'FIR' },
  { value: 'LEGAL_NOTICE', label: 'Legal Notice' },
  { value: 'AFFIDAVIT', label: 'Affidavit' },
  { value: 'DEED', label: 'Deed' },
  { value: 'AGREEMENT', label: 'Agreement' },
  { value: 'OTHER', label: 'Other' },
]

const ANALYSIS_TYPES = [
  { value: 'DOCUMENT_SUMMARY', label: '📋 Summary', desc: 'Overview of the document' },
  { value: 'RISK_ASSESSMENT', label: '⚠️ Risk Assessment', desc: 'Identify risky clauses' },
  { value: 'CLAUSE_EXTRACTION', label: '🔍 Clause Extraction', desc: 'Extract and explain clauses' },
  { value: 'COMPLIANCE_CHECK', label: '✅ Compliance Check', desc: 'Check Indian law compliance' },
]

const CATEGORY_COLORS = {
  CONTRACT: 'bg-blue-500/20 text-blue-300',
  COURT_ORDER: 'bg-purple-500/20 text-purple-300',
  FIR: 'bg-red-500/20 text-red-300',
  LEGAL_NOTICE: 'bg-orange-500/20 text-orange-300',
  AFFIDAVIT: 'bg-green-500/20 text-green-300',
  DEED: 'bg-yellow-500/20 text-yellow-300',
  AGREEMENT: 'bg-pink-500/20 text-pink-300',
  OTHER: 'bg-white/10 text-white/50',
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function FileIcon({ mimeType }) {
  if (mimeType === 'application/pdf') return <span className="text-2xl">📄</span>
  if (mimeType?.startsWith('image/')) return <span className="text-2xl">🖼️</span>
  return <span className="text-2xl">📝</span>
}

function AnalysisModal({ document, onClose, onAnalysisComplete }) {
  const [selectedType, setSelectedType] = useState('DOCUMENT_SUMMARY')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [analyses, setAnalyses] = useState([])
  const [loadingMessage, setLoadingMessage] = useState('')

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const res = await api.get(`/documents/${document.id}/analyses`)
      setAnalyses(res.data.data.analyses)
    } catch {}
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError('')
    setResult(null)

    const messages = [
      'Reading your document...',
      'Extracting text and structure...',
      'Analysing with AI...',
      'Identifying key clauses...',
      'Generating insights...',
      'Almost done...',
    ]
    let msgIndex = 0
    setLoadingMessage(messages[0])
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setLoadingMessage(messages[msgIndex])
    }, 5000)

    try {
      const res = await api.post(`/documents/${document.id}/analyze`, {
        analysisType: selectedType,
      })
      setResult(res.data.data.analysis)
      fetchAnalyses()
      onAnalysisComplete() // ← triggers document list refresh
    } catch (err) {
      const msg = err.response?.data?.message
      if (err.code === 'ECONNABORTED') {
        setError('Analysis is taking longer than expected. Please try again in a moment.')
      } else {
        setError(msg || 'Analysis failed. Please try again.')
      }
    } finally {
      clearInterval(msgInterval)
      setAnalyzing(false)
      setLoadingMessage('')
    }
  }

  const existingAnalysis = analyses.find(a => a.analysisType === selectedType)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-navy-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-navy-800">
          <div>
            <h2 className="font-heading text-xl text-white">AI Document Analysis</h2>
            <p className="text-white/50 text-sm mt-0.5 truncate max-w-sm">{document.title}</p>
          </div>
          <button
            onClick={onClose}
            disabled={analyzing}
            className="text-white/40 hover:text-white text-xl disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-white/50 text-sm mb-3">Select analysis type:</p>
            <div className="grid grid-cols-2 gap-2">
              {ANALYSIS_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    if (analyzing) return
                    setSelectedType(type.value)
                    setResult(null)
                    setError('')
                  }}
                  disabled={analyzing}
                  className={`p-3 rounded-xl border text-left transition-colors disabled:opacity-50 ${
                    selectedType === type.value
                      ? 'bg-saffron-500/20 border-saffron-500/50'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-white text-sm font-medium">{type.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{type.desc}</p>
                  {analyses.find(a => a.analysisType === type.value) && (
                    <span className="text-xs text-green-400 mt-1 block">✓ Already analyzed</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {analyzing && (
            <div className="bg-saffron-500/5 border border-saffron-500/20 rounded-xl p-6 mb-4 text-center">
              <div className="flex justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-saffron-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
              <p className="text-saffron-500 font-medium text-sm">{loadingMessage}</p>
              <p className="text-white/30 text-xs mt-2">
                AI analysis typically takes 15–30 seconds
              </p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-1">
                <div className="bg-saffron-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {!analyzing && (existingAnalysis && !result) ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/50 text-sm">Previous analysis result:</p>
                <button
                  onClick={handleAnalyze}
                  className="text-xs text-saffron-500 hover:underline"
                >
                  Re-analyze
                </button>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {existingAnalysis.result.text}
              </div>
            </div>
          ) : !analyzing && result ? (
            <div>
              <p className="text-white/50 text-sm mb-3">Analysis result:</p>
              <div className="bg-white/5 rounded-xl p-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {result.result.text}
              </div>
            </div>
          ) : !analyzing && (
            <button
              onClick={handleAnalyze}
              className="btn-primary w-full"
            >
              Run {ANALYSIS_TYPES.find(t => t.value === selectedType)?.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { logout } = useAuth()
  const fileInputRef = useRef(null)

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [analyzingDoc, setAnalyzingDoc] = useState(null)

  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'CONTRACT',
    file: null,
  })

  useEffect(() => { fetchDocuments() }, [])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents')
      setDocuments(res.data.data.documents)
    } catch {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return
    setUploadForm(f => ({
      ...f,
      file,
      title: f.title || file.name.replace(/\.[^/.]+$/, ''),
    }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file) { setError('Please select a file'); return }

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', uploadForm.file)
    formData.append('title', uploadForm.title)
    formData.append('category', uploadForm.category)

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Document uploaded successfully!')
      setShowUpload(false)
      setUploadForm({ title: '', category: 'CONTRACT', file: null })
      fetchDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      setDocuments(d => d.filter(doc => doc.id !== id))
      setSuccess('Document deleted')
    } catch {
      setError('Failed to delete document')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {analyzingDoc && (
        <AnalysisModal
          document={analyzingDoc}
          onClose={() => setAnalyzingDoc(null)}
          onAnalysisComplete={fetchDocuments}
        />
      )}

      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/lawyers" className="text-white/50 hover:text-white text-sm transition-colors">Lawyers</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <main className="px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-white mb-2">Documents</h1>
            <p className="text-white/50">Upload and analyse your legal documents with AI</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary"
          >
            {showUpload ? 'Cancel' : '+ Upload Document'}
          </button>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {showUpload && (
          <div className="card mb-8">
            <h2 className="font-heading text-lg text-white mb-6">Upload New Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-saffron-500 bg-saffron-500/5'
                  : uploadForm.file ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/20 hover:border-white/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={e => handleFileSelect(e.target.files[0])}
                />
                {uploadForm.file ? (
                  <div>
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-white font-medium">{uploadForm.file.name}</p>
                    <p className="text-white/40 text-sm mt-1">{formatBytes(uploadForm.file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📁</p>
                    <p className="text-white/70">Drop your file here or click to browse</p>
                    <p className="text-white/30 text-sm mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Document Title</label>
                <input
                  className="input"
                  placeholder="e.g. Rental Agreement 2024"
                  value={uploadForm.title}
                  onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Category</label>
                <select
                  className="input"
                  value={uploadForm.category}
                  onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📂</p>
            <p className="text-white/50 mb-2">No documents yet</p>
            <p className="text-white/30 text-sm">Upload your first legal document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="card hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileIcon mimeType={doc.mimeType} />
                    <div>
                      <h3 className="text-white font-medium">{doc.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category]}`}>
                          {doc.category.replace('_', ' ')}
                        </span>
                        <span className="text-white/30 text-xs">{formatBytes(doc.fileSize)}</span>
                        <span className="text-white/30 text-xs">{formatDate(doc.createdAt)}</span>
                        {doc.aiAnalyses?.length > 0 && (
                          <span className="text-xs bg-saffron-500/20 text-saffron-500 px-2 py-0.5 rounded-full">
                            {doc.aiAnalyses.length} AI {doc.aiAnalyses.length === 1 ? 'analysis' : 'analyses'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'ANALYZED' ? 'bg-green-500/20 text-green-400'
                      : doc.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-white/10 text-white/40'
                    }`}>
                      {doc.status}
                    </span>
                    <button
                      onClick={() => setAnalyzingDoc(doc)}
                      className="text-sm bg-saffron-500/10 hover:bg-saffron-500/20 text-saffron-500 border border-saffron-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      🤖 Analyse
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-white/20 hover:text-red-400 transition-colors text-sm px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}