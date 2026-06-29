import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getBudgets, addBudget, deleteBudget } from '../api/index.js'

const COLORS = ['#EC5677','#B2D579','#EEBE0D','#ADE6D5','#D7A889','#B91126']

export default function Budget() {
  const [budgets,  setBudgets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ name:'', spent:0, limit:0, color:'#EC5677' })

  const currentMonth = new Date().toLocaleString('default', { month:'long', year:'numeric' })
  const daysLeft     = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate() - new Date().getDate()

  useEffect(() => { fetchBudgets() }, [])

  async function fetchBudgets() {
    try { const res = await getBudgets(); setBudgets(res.data) }
    catch { setBudgets([]) }
    finally { setLoading(false) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await addBudget({ ...form, spent:Number(form.spent), limit:Number(form.limit) })
      toast.success('Budget category added!')
      setShowForm(false)
      setForm({ name:'', spent:0, limit:0, color:'#EC5677' })
      fetchBudgets()
    } catch { toast.error('Failed. Is backend running?') }
  }

  async function handleDelete(id) {
    try { await deleteBudget(id); toast.success('Deleted'); fetchBudgets() }
    catch { toast.error('Delete failed') }
  }

  const totalSpent = budgets.reduce((s,b)=>s+b.spent,0)
  const totalLimit = budgets.reduce((s,b)=>s+b.limit,0)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'#1a1a1a' }}>Budget Tracker</h1>
          <p style={{ fontSize:13, color:'#6b6b6b', marginTop:3 }}>{currentMonth} · {daysLeft} days remaining</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer', boxShadow:'0 2px 12px rgba(236,86,119,0.3)' }}>
          + Add Category
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
          { label:'Total Budgeted', value:`₹${totalLimit.toLocaleString('en-IN')}`, color:'#EEBE0D' },
          { label:'Total Spent',    value:`₹${totalSpent.toLocaleString('en-IN')}`, color:'#EC5677' },
          { label:'Remaining',      value:`₹${(totalLimit-totalSpent).toLocaleString('en-IN')}`, color:'#B2D579' },
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
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'#1a1a1a', marginBottom:16 }}>New Budget Category</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Category Name</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Food & Dining" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Amount Spent (₹)</label>
                <input type="number" min="0" value={form.spent} onChange={e=>setForm({...form,spent:e.target.value})} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Budget Limit (₹)</label>
                <input required type="number" min="1" value={form.limit} onChange={e=>setForm({...form,limit:e.target.value})} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Color</label>
              <div style={{ display:'flex', gap:8 }}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setForm({...form,color:c})}
                    style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer', border:form.color===c?'3px solid #1a1a1a':'3px solid transparent', transition:'border 0.2s' }} />
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:10, padding:'9px 22px', fontSize:13, fontWeight:500, cursor:'pointer' }}>Save</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ background:'#f8f6f3', color:'#6b6b6b', border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'9px 22px', fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
        {budgets.map((b,i) => {
          const pct  = Math.min((b.spent/b.limit)*100,100)
          const over = b.spent>b.limit
          const rem  = b.limit-b.spent
          return (
            <div key={b._id||i} style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:20, position:'relative', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', transition:'all 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
              onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:b.color, borderRadius:'14px 14px 0 0' }} />

              {b._id && (
                <button onClick={()=>handleDelete(b._id)}
                  style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'#AC9196', cursor:'pointer', fontSize:13 }}
                  onMouseOver={e=>e.target.style.color='#B91126'} onMouseOut={e=>e.target.style.color='#AC9196'}>✕</button>
              )}

              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:b.color, display:'inline-block' }} />
                  <span style={{ fontSize:14, fontWeight:500, color:'#1a1a1a' }}>{b.name}</span>
                  {over && <span style={{ fontSize:9, color:'#B91126', background:'#B9112615', padding:'2px 6px', borderRadius:4, fontWeight:500 }}>Over Budget</span>}
                </div>
                <div style={{ fontSize:12, color:'#6b6b6b', paddingLeft:16 }}>
                  Spent ₹{b.spent.toLocaleString('en-IN')} of ₹{b.limit.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background:'#f2f0ed', borderRadius:20, height:6, overflow:'hidden', marginBottom:8 }}>
                <div style={{ height:'100%', borderRadius:20, background:over?'#B91126':b.color, width:`${pct}%`, transition:'width 1s ease' }} />
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                <span style={{ color:'#6b6b6b' }}>{pct.toFixed(0)}% used</span>
                <span style={{ color:over?'#B91126':'#4a8a2a', fontWeight:500 }}>
                  {over ? `₹${Math.abs(rem).toLocaleString('en-IN')} over` : `₹${rem.toLocaleString('en-IN')} left`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const labelStyle = { display:'block', fontSize:10, color:'#6b6b6b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500 }
const inputStyle = { width:'100%', background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'9px 12px', color:'#1a1a1a', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', transition:'border-color 0.2s' }