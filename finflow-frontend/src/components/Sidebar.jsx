import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AVATAR_MAP = {
  f1:'f1', f2:'f2', f3:'f3', f4:'f4', f5:'f5', f6:'f6', f7:'f7', f8:'f8', f10:'f10',
  m1:'m1', m2:'m2', m3:'m3', m4:'m4', m5:'m5', m6:'m6', m7:'m7', m8:'m8',
  o1:'o1', o2:'o2', o3:'o3',
}

const navItems = [
  {
    label: 'Main',
    links: [
      { to:'/dashboard',    label:'Overview',     icon:<GridIcon />,   dot:'#EC5677' },
      { to:'/transactions', label:'Transactions', icon:<TxIcon />,     dot:'#EEBE0D' },
    ]
  },
  {
    label: 'Planning',
    links: [
      { to:'/budget', label:'Budget', icon:<BudgetIcon />, dot:'#B2D579' },
      { to:'/goals',  label:'Goals',  icon:<GoalIcon />,   dot:'#ADE6D5' },
    ]
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const avatarId = AVATAR_MAP[user.avatar] || 'f1'
  const [imgErr, setImgErr]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting]       = useState(false)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('See you soon! 👋')
    navigate('/login')
  }

  function handleAIClick() {
    window.dispatchEvent(new CustomEvent('openChat'))
    navigate('/dashboard')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${BASE_URL}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.success('Account deleted. Goodbye! 👋')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account')
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      {showConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:320, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:32, textAlign:'center', marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:'#1a1a1a', textAlign:'center', margin:'0 0 8px' }}>Delete Account?</h3>
            <p style={{ fontSize:13, color:'#6b6b6b', textAlign:'center', lineHeight:1.5, margin:'0 0 20px' }}>
              This will permanently delete your account and all data — transactions, budgets, and goals. This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid rgba(0,0,0,0.15)', background:'#fff', fontSize:13, color:'#6b6b6b', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}
              >Cancel</button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ flex:1, padding:'9px', borderRadius:10, border:'none', background:'#EC5677', fontSize:13, color:'#fff', cursor:deleting?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:500, opacity:deleting?0.7:1 }}
              >{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <aside style={{ width:230, minHeight:'100vh', background:'#ffffff', borderRight:'1px solid rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', padding:'24px 0', position:'fixed', top:0, left:0, bottom:0, zIndex:100 }}>

        <div style={{ padding:'0 20px 20px' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:600, color:'#1a1a1a' }}>
            Fin<span style={{ color:'#EC5677' }}>Flow</span>
          </div>
          <div style={{ fontSize:11, color:'#AC9196', marginTop:2 }}>Personal Finance Dashboard</div>
        </div>

        <div style={{ display:'flex', height:2, marginBottom:16 }}>
          {['#EC5677','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c => (
            <div key={c} style={{ flex:1, background:c }} />
          ))}
        </div>

        <div style={{ flex:1, padding:'0 10px' }}>
          {navItems.map(section => (
            <div key={section.label}>
              <div style={{ fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', color:'#AC9196', padding:'0 10px', margin:'14px 0 6px' }}>
                {section.label}
              </div>
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                    borderRadius:10, fontSize:14, marginBottom:2, textDecoration:'none', cursor:'pointer',
                    background: isActive ? `${link.dot}18` : 'transparent',
                    color:      isActive ? link.dot : '#6b6b6b',
                    fontWeight: isActive ? 500 : 400,
                    borderLeft: isActive ? `3px solid ${link.dot}` : '3px solid transparent',
                    paddingLeft: isActive ? 7 : 10,
                    transition: 'all 0.15s ease',
                  })}
                >
                  <span style={{ width:16, height:16, display:'flex', alignItems:'center', flexShrink:0 }}>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}

          <div style={{ fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', color:'#AC9196', padding:'0 10px', margin:'14px 0 6px' }}>
            AI Tools
          </div>
          <div
            onClick={handleAIClick}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, fontSize:14, color:'#EC5677', cursor:'pointer', fontWeight:500, transition:'all 0.15s', borderLeft:'3px solid transparent' }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(236,86,119,0.08)'; e.currentTarget.style.borderLeft='3px solid #EC5677' }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeft='3px solid transparent' }}
          >
            <span style={{ width:16, height:16, display:'flex', alignItems:'center', flexShrink:0 }}><ChatIcon /></span>
            AI Advisor ✦
          </div>
        </div>

        <div style={{ padding:'12px 14px 0', borderTop:'1px solid rgba(0,0,0,0.06)', marginTop:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'10px', borderRadius:12, background:'#f8f6f3' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'2px solid rgba(236,86,119,0.2)' }}>
              {!imgErr ? (
                <img src={`/avatars/${avatarId}.jpg`} alt="avatar" onError={() => setImgErr(true)}
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#EC5677,#EEBE0D)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:600 }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name || 'User'}</p>
              <span style={{ fontSize:10, color:'#AC9196', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block' }}>{user.email || ''}</span>
            </div>
          </div>

          <button onClick={handleLogout}
            style={{ width:'100%', background:'#fff', border:'1px solid rgba(236,86,119,0.3)', borderRadius:10, padding:'8px', fontSize:12, color:'#EC5677', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'DM Sans,sans-serif', fontWeight:500, marginBottom:6, transition:'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(236,86,119,0.06)'; e.currentTarget.style.borderColor='#EC5677' }}
            onMouseOut={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='rgba(236,86,119,0.3)' }}
          >
            <LogoutIcon /> Logout
          </button>

          <button onClick={() => setShowConfirm(true)}
            style={{ width:'100%', background:'#fff', border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'8px', fontSize:11, color:'#AC9196', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'DM Sans,sans-serif', fontWeight:400, marginBottom:14, transition:'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(236,86,119,0.04)'; e.currentTarget.style.color='#EC5677'; e.currentTarget.style.borderColor='rgba(236,86,119,0.2)' }}
            onMouseOut={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#AC9196'; e.currentTarget.style.borderColor='rgba(0,0,0,0.1)' }}
          >
            <TrashIcon /> Delete Account
          </button>
        </div>
      </aside>
    </>
  )
}

function GridIcon()   { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function TxIcon()     { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/></svg> }
function BudgetIcon() { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg> }
function GoalIcon()   { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> }
function ChatIcon()   { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function LogoutIcon() { return <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function TrashIcon()  { return <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> }