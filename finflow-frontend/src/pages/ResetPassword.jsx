import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function isStrongPassword(pwd) {
  return pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)
}

export default function ResetPassword() {
  const { token }               = useParams()
  const navigate                = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (!isStrongPassword(password)) {
      toast.error('Password needs 8+ chars, with uppercase, lowercase, and a number')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password/${token}`, { password })
      toast.success('Password reset! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed or link expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8f6f3', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/avatars/26.jpg" alt="FinFlow" style={{ width:64, height:64, objectFit:'contain', marginBottom:8, borderRadius:'50%' }}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }}
          />
          <div style={{ display:'none', fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:600, color:'#1a1a1a' }}>
            Fin<span style={{ color:'#EC5677' }}>Flow</span>
          </div>
          <div style={{ fontSize:13, color:'#AC9196', marginTop:6 }}>Personal Finance Dashboard</div>
        </div>

        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:20, padding:36, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'#1a1a1a', marginBottom:4 }}>Reset Password</h2>
          <p style={{ fontSize:13, color:'#AC9196', marginBottom:24 }}>Enter your new password below.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" required placeholder="8+ chars, mixed case + number" value={password}
                onChange={e=>setPassword(e.target.value)} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#EC5677'}
                onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'}
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" required placeholder="••••••••" value={confirm}
                onChange={e=>setConfirm(e.target.value)} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#EC5677'}
                onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'#EC5677', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontSize:14, fontWeight:500, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.2s' }}
              onMouseOver={e=>!loading&&(e.currentTarget.style.background='#d44a6a')}
              onMouseOut={e=>(e.currentTarget.style.background='#EC5677')}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>

        <div style={{ display:'flex', height:3, borderRadius:20, overflow:'hidden', marginTop:16, gap:1 }}>
          {['#EC5677','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c => (
            <div key={c} style={{ flex:1, background:c }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display:'block', fontSize:11, color:'#6b6b6b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500 }
const inputStyle = { width:'100%', background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'11px 14px', color:'#1a1a1a', fontSize:14, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', transition:'border-color 0.2s' }