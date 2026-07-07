import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || ''

function shortAct(act) {
  return act ? act.replace(/^The\s+/i, '') : act
}

function Cursor() {
  return <span className="cursor" />
}

function CitationChips({ citations }) {
  if (!citations || citations.length === 0) return null
  return (
    <div className="msg-ai-actions">
      {citations.map((c, i) => (
        <button key={i} className="chip" title={`${shortAct(c.act)}, Section ${c.section_number}`}>
          {shortAct(c.act)} §{c.section_number}
        </button>
      ))}
    </div>
  )
}

async function* readSSE(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const frames = buffer.split('\n\n')
    buffer = frames.pop()

    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      try {
        yield JSON.parse(line.slice(6))
      } catch {
        // ignore malformed frame
      }
    }
  }
}

export default function ChatWindow({ conversationId, onConversationStarted }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pinnedToBottom, setPinnedToBottom] = useState(true)
  const bodyRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    if (!conversationId) {
      setMessages([])
      return
    }
    setLoadingHistory(true)
    api.get(`/chat/history/${conversationId}`)
      .then((res) => {
        if (cancelled) return
        setMessages(res.data.data.messages.map((m) => ({ ...m, stage: 'done' })))
      })
      .catch(() => { if (!cancelled) setMessages([]) })
      .finally(() => { if (!cancelled) setLoadingHistory(false) })
    return () => { cancelled = true }
  }, [conversationId])

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (pinnedToBottom) scrollToBottom()
  }, [messages, pinnedToBottom, scrollToBottom])

  const handleScroll = () => {
    const el = bodyRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setPinnedToBottom(distanceFromBottom < 80)
  }

  const sendMessage = async (text) => {
    const query = (text ?? input).trim()
    if (!query || isStreaming) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const historyForRequest = messages
      .filter((m) => m.stage === 'done' || m.role === 'user')
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: query, stage: 'done' },
      { role: 'assistant', content: '', citations: [], stage: 'thinking' },
    ])
    setPinnedToBottom(true)
    setIsStreaming(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, history: historyForRequest, conversationId: conversationId || undefined }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`)
      }

      for await (const event of readSSE(response)) {
        if (event.type === 'token') {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            next[next.length - 1] = { ...last, content: last.content + event.content, stage: 'streaming' }
            return next
          })
        } else if (event.type === 'citations') {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], citations: event.sources }
            return next
          })
        } else if (event.type === 'done') {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], stage: 'done' }
            return next
          })
          if (!conversationId && event.conversationId && onConversationStarted) {
            onConversationStarted(event.conversationId)
          }
        } else if (event.type === 'error') {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], stage: 'error', content: event.message }
            return next
          })
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = {
          ...next[next.length - 1],
          stage: 'error',
          content: 'Could not reach the assistant. Please check your connection and try again.',
        }
        return next
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const SAMPLE_PROMPTS = [
    'What are the grounds for divorce under Hindu law?',
    'Who gets custody of a minor child after divorce?',
    'What is the punishment for cheating under IPC?',
    'How is maintenance calculated for a wife after divorce?',
  ]

  return (
    <div className="chat-page-main">
      <div className="chat-page-body" ref={bodyRef} onScroll={handleScroll}>
        {loadingHistory ? (
          <div className="chat-page-empty"><span className="typing"><span /><span /><span /></span></div>
        ) : messages.length === 0 ? (
          <div className="chat-page-empty">
            <div>
              <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>NyayAI · Legal Assistant</div>
              <h2 className="h3" style={{ color: 'var(--ink)' }}>Ask about Indian personal law, IPC, CrPC, and more</h2>
            </div>
            <div className="chat-prompts" style={{ justifyContent: 'center' }}>
              {SAMPLE_PROMPTS.map((p) => (
                <button key={p} className="prompt-chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-page-body-inner">
            {messages.map((m, i) => (
              m.role === 'user' ? (
                <div className="msg msg-user" key={i}>{m.content}</div>
              ) : (
                <div className="msg msg-ai" key={i}>
                  <div className="msg-ai-role">
                    <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%' }} />
                    <span>NyayAI</span>
                    {m.stage === 'streaming' && <span style={{ color: 'var(--ink-4)', marginLeft: 8 }}>· responding</span>}
                  </div>
                  {m.stage === 'thinking' ? (
                    <div className="typing"><span /><span /><span /></div>
                  ) : m.stage === 'error' ? (
                    <div className="msg-error">{m.content}</div>
                  ) : (
                    <>
                      <div className="msg-ai-body">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                        {m.stage === 'streaming' && <Cursor />}
                      </div>
                      <CitationChips citations={m.citations} />
                    </>
                  )}
                </div>
              )
            ))}
            {!pinnedToBottom && (
              <div className="chat-scroll-to-bottom">
                <button onClick={() => { setPinnedToBottom(true); scrollToBottom() }}>↓ New messages</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chat-page-foot">
        <div className="chat-page-foot-inner">
          <textarea
            ref={textareaRef}
            className="chat-page-textarea"
            placeholder="Ask a legal question... (Shift+Enter for new line)"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            style={{ opacity: isStreaming || !input.trim() ? 0.4 : 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 7h10M7 2l5 5-5 5" />
            </svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--ink-4)' }}>
          NyayAI can make mistakes. For specific legal advice, consult a qualified lawyer.
        </p>
      </div>
    </div>
  )
}
