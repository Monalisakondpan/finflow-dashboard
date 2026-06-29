import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/index.js'
import toast from 'react-hot-toast'

const FEMALE_AVATARS = [
  { id:'f1',  label:'Dark Vibes'   },
  { id:'f2',  label:'Moody Girl'   },
  { id:'f3',  label:'Black Outfit' },
  { id:'f4',  label:'Cool Girl'    },
  { id:'f5',  label:'Cat Cafe'     },
  { id:'f6',  label:'Coder Girl'   },
  { id:'f7',  label:'Office Girl'  },
  { id:'f8',  label:'Money Boss'   },
  { id:'f10', label:'Anime Girl'   },
]
const MALE_AVATARS = [
  { id:'m1', label:'White Hair'  },
  { id:'m2', label:'Cool Boy'    },
  { id:'m3', label:'Dark Boy'    },
  { id:'m4', label:'Chibi Boy'   },
  { id:'m5', label:'Cat Boy'     },
  { id:'m6', label:'Green Boy'   },
  { id:'m7', label:'Selfie Boy'  },
  { id:'m8', label:'Cap Boy'     },
]
const OTHER_AVATARS = [
  { id:'o1', label:'Panda Coder' },
  { id:'o2', label:'Cat Lover'   },
  { id:'o3', label:'Soft Vibes'  },
  { id:'f1', label:'Dark Vibes'  },
  { id:'m1', label:'White Hair'  },
]

export default function Register() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', gender:'female', avatar:'f1' })
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const avatars = form.gender==='female' ? FEMALE_AVATARS : form.gender==='male' ? MALE_AVATARS : OTHER_AVATARS

  function handleGenderChange(gender) {
    const def = gender==='female'?'f1':gender==='male'?'m1':'o1'
    setForm({...form, gender, avatar:def})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match!'); return }
    if (!(form.password.length >= 8 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password))) {
      toast.error('Password needs 8+ chars, with uppercase, lowercase, and a number')
      return
    }
    setLoading(true)
    try {
      const res = await register({ name:form.name, email:form.email, password:form.password, gender:form.gender, avatar:form.avatar })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      toast.success(`Welcome, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8f6f3', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', padding:'20px 0' }}>
      <div style={{ width:'100%', maxWidth:500, padding:'0 20px' }}>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:600, color:'#1a1a1a' }}>
            Fin<span style={{ color:'#EC5677' }}>Flow</span>
          </div>
          <div style={{ fontSize:12, color:'#AC9196', marginTop:4 }}>Create your account</div>
        </div>

        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:4 }}>Create account</h2>
          <p style={{ fontSize:12, color:'#AC9196', marginBottom:22 }}>Fill in your details below</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@gmail.com" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="8+ chars, mixed case + number" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Confirm</label>
                <input required type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>I am...</label>
              <div style={{ display:'flex', gap:8 }}>
                {[
                  {value:'female', label:'Female', color:'#EC5677'},
                  {value:'male',   label:'Male',   color:'#ADE6D5'},
                  {value:'other',  label:'Other',  color:'#EEBE0D'},
                ].map(g => (
                  <button key={g.value} type="button" onClick={()=>handleGenderChange(g.value)}
                    style={{ flex:1, padding:'9px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s',
                      background: form.gender===g.value ? g.color : '#f8f6f3',
                      color:      form.gender===g.value ? '#fff'   : '#6b6b6b',
                      border:     form.gender===g.value ? 'none'   : '1px solid rgba(0,0,0,0.1)',
                      fontWeight: form.gender===g.value ? 600      : 400,
                    }}
                  >{g.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={labelStyle}>Pick your avatar</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                {avatars.map(a => (
                  <div key={a.id} onClick={()=>setForm({...form,avatar:a.id})}
                    style={{ borderRadius:10, overflow:'hidden', cursor:'pointer', position:'relative',
                      border: form.avatar===a.id ? '2px solid #EC5677' : '2px solid transparent',
                      boxShadow: form.avatar===a.id ? '0 0 12px rgba(236,86,119,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                      transition:'all 0.2s',
                      transform: form.avatar===a.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <img src={`/avatars/${a.id}.jpg`} alt={a.label}
                      style={{ width:'100%', aspectRatio:'1', objectFit:'cover', objectPosition:'top', display:'block' }}
                      onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
                    />
                    <div style={{ display:'none', width:'100%', aspectRatio:'1', background:'#f8f6f3', alignItems:'center', justifyContent:'center', fontSize:20 }}>👤</div>
                    {form.avatar===a.id && (
                      <div style={{ position:'absolute', top:3, right:3, width:14, height:14, borderRadius:'50%', background:'#EC5677', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff' }}>✓</div>
                    )}
                    <div style={{ padding:'3px', background:'rgba(0,0,0,0.04)', textAlign:'center' }}>
                      <span style={{ fontSize:9, color: form.avatar===a.id ? '#EC5677' : '#6b6b6b' }}>{a.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'#EC5677', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontSize:14, fontWeight:500, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.2s', boxShadow:'0 2px 12px rgba(236,86,119,0.3)' }}
              onMouseOver={e=>!loading&&(e.currentTarget.style.background='#d44a6a')}
              onMouseOut={e=>(e.currentTarget.style.background='#EC5677')}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#AC9196' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#EC5677', fontWeight:500 }}>Sign in</Link>
          </div>
        </div>

        <div style={{ display:'flex', height:3, borderRadius:20, overflow:'hidden', marginTop:14, gap:1 }}>
          {['#EC5677','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c=>(
            <div key={c} style={{ flex:1, background:c }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display:'block', fontSize:10, color:'#6b6b6b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500 }
const inputStyle = { width:'100%', background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'10px 13px', color:'#1a1a1a', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', transition:'border-color 0.2s' }