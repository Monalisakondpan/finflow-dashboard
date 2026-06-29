import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getGoals, addGoal, deleteGoal, updateGoal } from '../api/index.js'

export default function Goals() {
  const [goals,    setGoals]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ name:'', target:'', saved:'', icon:'🎯', color:'#EC5677' })

  useEffect(() => { fetchGoals() }, [])

  async function fetchGoals() {
    try {
      const res = await getGoals()
      setGoals(res.data)
    } catch { setGoals([]) }
    finally { setLoading(false) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await addGoal({ name:form.name, target:Number(form.target), saved:Number(form.saved)||0, icon:form.icon, color:form.color })
      toast.success('Goal added!')
      setForm({ name:'', target:'', saved:'', icon:'🎯', color:'#EC5677' })
      setShowForm(false)
      fetchGoals()
    } catch { toast.error('Failed. Is backend running?') }
  }

  async function handleDelete(id) {
    try { await deleteGoal(id); toast.success('Goal removed!'); fetchGoals() }
    catch { toast.error('Failed to delete') }
  }

  async function handleUpdate(id, target) {
    const amount = prompt('Enter new saved amount (₹):')
    if (!amount) return
    try { await updateGoal(id, { saved: Math.min(Number(amount), target) }); toast.success('Updated!'); fetchGoals() }
    catch { toast.error('Failed') }
  }

  const totalSaved  = goals.reduce((s,g) => s+g.saved, 0)
  const totalTarget = goals.reduce((s,g) => s+g.target, 0)

  const COLORS = ['#EC5677','#B2D579','#EEBE0D','#ADE6D5','#D7A889','#B91126']

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'#1a1a1a' }}>Financial Goals 🎯</h1>
          <p style={{ fontSize:13, color:'#6b6b6b', marginTop:3 }}>Track your savings goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer', boxShadow:'0 2px 12px rgba(236,86,119,0.3)' }}>
          + Add Goal
        </button>
      </div>

      {/* Color strip */}
      <div style={{ display:'flex', height:3, borderRadius:20, overflow:'hidden', marginBottom:20, gap:1 }}>
        {['#EC5677','#B91126','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c=>(
          <div key={c} style={{ flex:1, background:c }} />
        ))}
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Goals',  value:goals.length,                               color:'#EC5677' },
          { label:'Total Saved',  value:`₹${totalSaved.toLocaleString('en-IN')}`,   color:'#B2D579' },
          { label:'Total Target', value:`₹${totalTarget.toLocaleString('en-IN')}`,  color:'#EEBE0D' },
        ].map(c => (
          <div key={c.label} style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:10, color:'#AC9196', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8, fontWeight:500 }}>{c.label}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:500, color:c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:22, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'#1a1a1a', marginBottom:16 }}>New Goal</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Goal Name</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Emergency Fund" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Target (₹)</label>
                <input required type="number" min="1" value={form.target} onChange={e=>setForm({...form,target:e.target.value})} placeholder="100000" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Saved (₹)</label>
                <input type="number" min="0" value={form.saved} onChange={e=>setForm({...form,saved:e.target.value})} placeholder="0" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Icon</label>
                <input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Color</label>
              <div style={{ display:'flex', gap:8 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={()=>setForm({...form,color:c})}
                    style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer', border: form.color===c?'3px solid #1a1a1a':'3px solid transparent', transition:'border 0.2s' }} />
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:10, padding:'9px 22px', fontSize:13, fontWeight:500, cursor:'pointer' }}>Save Goal</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ background:'#f8f6f3', color:'#6b6b6b', border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'9px 22px', fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {!loading && goals.length===0 && (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:6 }}>No goals yet!</div>
          <div style={{ fontSize:13, color:'#6b6b6b', marginBottom:20 }}>Start by adding your first financial goal</div>
          <button onClick={()=>setShowForm(true)} style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:20, padding:'10px 24px', fontSize:13, fontWeight:500, cursor:'pointer' }}>+ Add Your First Goal</button>
        </div>
      )}

      {loading && <div style={{ textAlign:'center', padding:'60px 0', color:'#6b6b6b', fontSize:13 }}>Loading goals...</div>}

      {/* Goals Grid */}
      {!loading && goals.length>0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {goals.map(g => {
            const pct  = Math.min((g.saved/g.target)*100,100)
            const done = pct>=100
            return (
              <div key={g._id} style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:20, position:'relative', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', transition:'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
              >
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:g.color, borderRadius:'14px 14px 0 0' }} />

                <button onClick={()=>handleDelete(g._id)}
                  style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'#AC9196', cursor:'pointer', fontSize:13, lineHeight:1 }}
                  onMouseOver={e=>e.target.style.color='#B91126'}
                  onMouseOut={e=>e.target.style.color='#AC9196'}
                >✕</button>

                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${g.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{g.icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#1a1a1a' }}>{g.name}</div>
                    <div style={{ fontSize:11, color:'#6b6b6b', marginTop:2 }}>
                      {done ? '🎉 Goal reached!' : `₹${(g.target-g.saved).toLocaleString('en-IN')} remaining`}
                    </div>
                  </div>
                  {done && <div style={{ marginLeft:'auto', fontSize:10, background:'#EC567715', color:'#EC5677', padding:'3px 8px', borderRadius:20, fontWeight:500 }}>Done ✓</div>}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'#1a1a1a', fontWeight:500 }}>₹{g.saved.toLocaleString('en-IN')} saved</span>
                  <span style={{ fontSize:12, color:'#6b6b6b' }}>₹{g.target.toLocaleString('en-IN')} target</span>
                </div>

                <div style={{ background:'#f2f0ed', borderRadius:20, height:6, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ height:'100%', borderRadius:20, background:g.color, width:`${pct}%`, transition:'width 1s ease' }} />
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'#6b6b6b' }}>{pct.toFixed(0)}% complete</span>
                  <button onClick={()=>handleUpdate(g._id, g.target)}
                    style={{ fontSize:11, color:g.color, background:`${g.color}15`, border:`1px solid ${g.color}40`, borderRadius:20, padding:'3px 10px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>
                    + Update
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelStyle = { display:'block', fontSize:10, color:'#6b6b6b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500 }
const inputStyle = { width:'100%', background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'9px 12px', color:'#1a1a1a', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', transition:'border-color 0.2s' }