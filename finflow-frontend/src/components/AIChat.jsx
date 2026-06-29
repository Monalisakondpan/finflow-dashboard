import React, { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/index.js'

const SUGGESTIONS = [
  'Why did I overspend?',
  'How to improve my score?',
  'Give me savings tips',
  'Analyze my spending',
]

function cleanReply(text) {
  if (!text) return text
  let cleaned = text
  cleaned = cleaned.replace(/<function=[^>]*>[\s\S]*?<\/function>/g, '')
  cleaned = cleaned.replace(/<function=[^>]*\{[\s\S]*?\}>/g, '')
  cleaned = cleaned.replace(/<\/?function[^>]*>/g, '')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()
  return cleaned || "I'm fetching your data, please try again in a moment."
}

export default function AIChat({ isOpen, onClose, dashboardContext }) {
  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user.name || 'there'
  const avatarId = user.avatar || 'f1'

  const [messages, setMessages] = useState([
    { role:'assistant', content:`Hey ${userName}! 👋 I'm your AI Financial Advisor. I know your finances and I'm here to help you grow your money! What would you like to know?` }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showSugs, setShowSugs] = useState(true)
  const [imgErr, setImgErr]     = useState(false)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, loading])

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setShowSugs(false)
    const history = [...messages, { role:'user', content:msg }]
    setMessages(history)
    setLoading(true)
    try {
      const res = await sendChatMessage(
        history.map(m => ({ role:m.role, content:m.content })),
        dashboardContext
      )
      const reply = cleanReply(res.data.reply)
      setMessages(prev => [...prev, { role:'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠️ Could not connect. Make sure backend is running!' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:200 }} />
      <div style={{ position:'fixed', bottom:24, right:24, width:400, height:540, background:'#ffffff', border:'1px solid rgba(0,0,0,0.1)', borderRadius:20, display:'flex', flexDirection:'column', zIndex:201, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', overflow:'hidden' }}>

        {/* Color bar */}
        <div style={{ display:'flex', height:3 }}>
          {['#EC5677','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c=>(
            <div key={c} style={{ flex:1, background:c }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#EC567715', border:'1px solid #EC567730', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:'#1a1a1a' }}>AI Financial Advisor</div>
              <div style={{ fontSize:10, color:'#B2D579', marginTop:1, fontWeight:500 }}>● Online · Powered by Groq</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid rgba(0,0,0,0.1)', color:'#6b6b6b', fontSize:16, padding:'4px 9px', cursor:'pointer', borderRadius:8, transition:'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.background='#f2f0ed'}
            onMouseOut={e=>e.currentTarget.style.background='none'}
          >×</button>
        </div>

        {/* Messages */}
        <div ref={messagesRef} style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-end', flexDirection:m.role==='user'?'row-reverse':'row' }}>
              <div style={{ flexShrink:0, width:26, height:26, borderRadius:'50%', overflow:'hidden', background:m.role==='user'?'#EC567715':'#f2f0ed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>
                {m.role==='user' ? (
                  !imgErr
                    ? <img src={`/avatars/${avatarId}.jpg`} alt="" onError={()=>setImgErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
                    : <span>{user.name?.[0]?.toUpperCase()||'U'}</span>
                ) : '🤖'}
              </div>
              <div style={{
                maxWidth:'75%', padding:'9px 13px', borderRadius:12, fontSize:13, lineHeight:1.55,
                background: m.role==='user' ? '#EC5677' : '#f8f6f3',
                color: m.role==='user' ? '#fff' : '#1a1a1a',
                borderBottomRightRadius: m.role==='user' ? 4 : 12,
                borderBottomLeftRadius:  m.role==='assistant' ? 4 : 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'#f2f0ed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🤖</div>
              <div style={{ background:'#f8f6f3', padding:'10px 14px', borderRadius:'12px 12px 12px 4px', display:'flex', gap:4 }}>
                {[0,150,300].map(d=>(
                  <span key={d} style={{ width:6, height:6, background:'#AC9196', borderRadius:'50%', display:'inline-block', animation:`pulse 1.2s infinite ${d}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {showSugs && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'0 14px 10px' }}>
            {SUGGESTIONS.map((s,i) => {
              const colors = ['#EC5677','#EEBE0D','#B2D579','#ADE6D5']
              return (
                <button key={s} onClick={()=>handleSend(s)}
                  style={{ background:'#f8f6f3', border:`1px solid ${colors[i]}50`, borderRadius:20, padding:'5px 11px', fontSize:11, color:colors[i], cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s', fontWeight:500 }}
                  onMouseOver={e=>{e.target.style.background=`${colors[i]}15`}}
                  onMouseOut={e=>{e.target.style.background='#f8f6f3'}}
                >{s}</button>
              )
            })}
          </div>
        )}

        {/* Input */}
        <div style={{ padding:12, borderTop:'1px solid rgba(0,0,0,0.06)', display:'flex', gap:8, background:'#fafafa' }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend()}}}
            placeholder="Ask about your finances..." rows={1}
            style={{ flex:1, background:'#ffffff', border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'9px 13px', color:'#1a1a1a', fontSize:13, outline:'none', resize:'none', fontFamily:'DM Sans,sans-serif', transition:'border 0.2s' }}
            onFocus={e=>e.target.style.borderColor='#EC5677'}
            onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.1)'}
          />
          <button onClick={()=>handleSend()} disabled={loading}
            style={{ background:'#EC5677', border:'none', borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', alignSelf:'flex-end', opacity:loading?0.5:1, cursor:loading?'not-allowed':'pointer', boxShadow:'0 2px 8px rgba(236,86,119,0.3)', transition:'all 0.2s' }}
            onMouseOver={e=>!loading&&(e.currentTarget.style.background='#d44a6a')}
            onMouseOut={e=>(e.currentTarget.style.background='#EC5677')}
          >
            <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}