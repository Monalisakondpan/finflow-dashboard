import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { login } from '../api/index.js'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]               = useState({ email:'', password:'' })
  const [loading, setLoading]         = useState(false)
  const [showForgot, setShowForgot]   = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      toast.success('Reset link sent! Check your email.')
      setShowForgot(false)
      setForgotEmail('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8f6f3', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/avatars/26.jpg" alt="FinFlow" style={{ width:64, height:64, objectFit:'contain', marginBottom:8, borderRadius:'50%' }}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }}
          />
          <div style={{ display:'none', fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:600, color:'#1a1a1a' }}>
            Fin<span style={{ color:'#EC5677' }}>Flow</span>
          </div>
          <div style={{ fontSize:13, color:'#AC9196', marginTop:6 }}>Personal Finance Dashboard</div>
          <div style={{ display:'flex', justifyContent:'center', gap:4, marginTop:12 }}>
            {['#EC5677','#EEBE0D','#B2D579','#ADE6D5','#D7A889'].map(c => (
              <div key={c} style={{ width:6, height:6, borderRadius:'50%', background:c }} />
            ))}
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, width:340, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'#1a1a1a', margin:'0 0 8px' }}>Forgot Password</h3>
              <p style={{ fontSize:13, color:'#AC9196', margin:'0 0 20px' }}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email" required placeholder="you@gmail.com"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  style={{ ...inputStyle, marginBottom:16 }}
                  onFocus={e=>e.target.style.borderColor='#EC5677'}
                  onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'}
                />
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowForgot(false)}
                    style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid rgba(0,0,0,0.15)', background:'#fff', fontSize:13, color:'#6b6b6b', cursor:'pointer' }}
                  >Cancel</button>
                  <button type="submit" disabled={forgotLoading}
                    style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#EC5677', fontSize:13, color:'#fff', cursor:forgotLoading?'not-allowed':'pointer', opacity:forgotLoading?0.7:1 }}
                  >{forgotLoading ? 'Sending...' : 'Send Link'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:20, padding:36, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'#1a1a1a', marginBottom:4 }}>Welcome back</h2>
          <p style={{ fontSize:13, color:'#AC9196', marginBottom:24 }}>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" required placeholder="you@gmail.com" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#EC5677'}
                onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'}
              />
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#EC5677'}
                onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'}
              />
            </div>

            <div style={{ textAlign:'right', marginBottom:20 }}>
              <button type="button" onClick={() => setShowForgot(true)}
                style={{ background:'none', border:'none', color:'#EC5677', fontSize:12, cursor:'pointer', padding:0, fontFamily:'DM Sans,sans-serif' }}
              >Forgot password?</button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'#EC5677', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontSize:14, fontWeight:500, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.2s' }}
              onMouseOver={e => !loading && (e.currentTarget.style.background='#d44a6a')}
              onMouseOut={e => (e.currentTarget.style.background='#EC5677')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#AC9196' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#EC5677', fontWeight:500 }}>Create one</Link>
          </div>
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