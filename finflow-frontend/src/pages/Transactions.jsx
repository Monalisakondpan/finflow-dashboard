import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTransactions, addTransaction, deleteTransaction } from '../api/index.js'

const CATEGORIES = ['Food & Dining','Housing','Shopping','Transport','Subscriptions','Income','Entertainment','Health','Other']
const ICONS = { 'Food & Dining':'🍔','Housing':'🏠','Shopping':'🛍','Transport':'🚕','Subscriptions':'📱','Income':'💼','Entertainment':'🎬','Health':'💊','Other':'💳' }
const CAT_COLORS = { 'Food & Dining':'#EC5677','Housing':'#EEBE0D','Shopping':'#B91126','Transport':'#ADE6D5','Subscriptions':'#D7A889','Income':'#B2D579','Entertainment':'#D9FF2F','Health':'#AC9196','Other':'#6b6b6b' }

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [filter,       setFilter]       = useState('All')
  const [form, setForm] = useState({ name:'', amount:'', category:'Food & Dining', type:'debit', date:new Date().toISOString().split('T')[0] })

  useEffect(() => { fetchTx() }, [])

  async function fetchTx() {
    try { const res = await getTransactions(); setTransactions(res.data) }
    catch { setTransactions([]) }
    finally { setLoading(false) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      const amount = form.type==='debit' ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount))
      await addTransaction({ ...form, amount, icon:ICONS[form.category]||'💳' })
      toast.success('Transaction added!')
      setShowForm(false)
      setForm({ name:'', amount:'', category:'Food & Dining', type:'debit', date:new Date().toISOString().split('T')[0] })
      fetchTx()
    } catch { toast.error('Failed. Is backend running?') }
  }

  async function handleDelete(id) {
    try { await deleteTransaction(id); toast.success('Deleted'); fetchTx() }
    catch { toast.error('Delete failed') }
  }

  const filtered = filter==='All' ? transactions : transactions.filter(t=>t.category===filter)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'#1a1a1a' }}>Transactions</h1>
          <p style={{ fontSize:13, color:'#6b6b6b', marginTop:3 }}>{transactions.length} transactions this month</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer', boxShadow:'0 2px 12px rgba(236,86,119,0.3)' }}>
          + Add Transaction
        </button>
      </div>

      {/* Color strip */}
      <div style={{ display:'flex', height:3, borderRadius:20, overflow:'hidden', marginBottom:20, gap:1 }}>
        {['#EC5677','#B91126','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889'].map(c=>(
          <div key={c} style={{ flex:1, background:c }} />
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:22, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'#1a1a1a', marginBottom:16 }}>New Transaction</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={labelStyle}>Description</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Swiggy" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <input required type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#EC5677'} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.12)'} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inputStyle}>
                  <option value="debit">Expense</option>
                  <option value="credit">Income</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:10, padding:'9px 22px', fontSize:13, fontWeight:500, cursor:'pointer' }}>Save</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ background:'#f8f6f3', color:'#6b6b6b', border:'1px solid rgba(0,0,0,0.1)', borderRadius:10, padding:'9px 22px', fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['All',...CATEGORIES].map(cat => (
          <button key={cat} onClick={()=>setFilter(cat)}
            style={{ background: filter===cat ? (CAT_COLORS[cat]||'#EC5677') : '#ffffff', color: filter===cat ? '#fff' : '#6b6b6b', border: filter===cat ? 'none' : '1px solid rgba(0,0,0,0.1)', borderRadius:20, padding:'6px 14px', fontSize:12, cursor:'pointer', fontWeight: filter===cat?500:400, transition:'all 0.2s', boxShadow: filter===cat?'0 2px 8px rgba(0,0,0,0.1)':'none' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 50px', padding:'10px 18px', borderBottom:'1px solid rgba(0,0,0,0.06)', fontSize:10, color:'#AC9196', letterSpacing:'0.8px', textTransform:'uppercase', fontWeight:500, background:'#fafafa' }}>
          <span>Description</span><span>Category</span><span>Date</span><span style={{textAlign:'right'}}>Amount</span><span />
        </div>

        {loading && <div style={{ padding:40, textAlign:'center', color:'#6b6b6b', fontSize:13 }}>Loading...</div>}
        {!loading && filtered.length===0 && <div style={{ padding:40, textAlign:'center', color:'#6b6b6b', fontSize:13 }}>No transactions found</div>}

        {!loading && filtered.map((t,i) => (
          <div key={t._id||i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 50px', padding:'12px 18px', borderBottom:i<filtered.length-1?'1px solid rgba(0,0,0,0.05)':'none', alignItems:'center', transition:'background 0.15s' }}
            onMouseOver={e=>e.currentTarget.style.background='#fafafa'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}
          >
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${CAT_COLORS[t.category]||'#EC5677'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                {t.icon||ICONS[t.category]||'💳'}
              </div>
              <span style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{t.name}</span>
            </div>
            <span style={{ fontSize:12, color:'#6b6b6b' }}>{t.category}</span>
            <span style={{ fontSize:12, color:'#6b6b6b' }}>{t.date}</span>
            <span style={{ fontSize:13, fontWeight:500, textAlign:'right', color:t.amount>0?'#4a8a2a':'#B91126' }}>
              {t.amount>0?'+':'-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
            </span>
            <div style={{ textAlign:'center' }}>
              {t._id && (
                <button onClick={()=>handleDelete(t._id)} style={{ background:'none', border:'none', color:'#AC9196', cursor:'pointer', fontSize:13 }}
                  onMouseOver={e=>e.target.style.color='#B91126'} onMouseOut={e=>e.target.style.color='#AC9196'}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle = { display:'block', fontSize:10, color:'#6b6b6b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:500 }
const inputStyle = { width:'100%', background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'9px 12px', color:'#1a1a1a', fontSize:13, outline:'none', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', transition:'border-color 0.2s' }