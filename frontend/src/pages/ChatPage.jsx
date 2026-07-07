import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ChatWindow from '../components/ChatWindow'

export default function ChatPage() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadConversations = useCallback(() => {
    api.get('/chat/conversations')
      .then((res) => setConversations(res.data.data.conversations))
      .catch(() => {})
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  const handleConversationStarted = (newId) => {
    setActiveId(newId)
    loadConversations()
  }

  const handleSelect = (id) => {
    setActiveId(id)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    setActiveId(null)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10" style={{ height: 65, boxSizing: 'border-box' }}>
        <div className="flex items-center gap-3">
          <button className="chat-mobile-toggle" onClick={() => setSidebarOpen((o) => !o)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
          <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        </div>
        <div className="chat-header-links flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/legal-research" className="text-white/50 hover:text-white text-sm transition-colors">Simple search</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <div className="chat-page">
        <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="chat-sidebar-new" onClick={handleNewChat}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 2v10M2 7h10" /></svg>
            New chat
          </button>
          <div className="chat-sidebar-label">Recent</div>
          {conversations.length === 0 ? (
            <p style={{ color: 'var(--ink-4)', fontSize: 12.5, padding: '4px 12px' }}>No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                className={`chat-sidebar-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => handleSelect(c.id)}
              >
                {c.title || 'Untitled conversation'}
              </button>
            ))
          )}
        </aside>

        <ChatWindow key={activeId || 'new'} conversationId={activeId} onConversationStarted={handleConversationStarted} />
      </div>
    </div>
  )
}
