import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import MetricCard from '../components/MetricCard.jsx'
import AIChat from '../components/AIChat.jsx'
import { getDashboardSummary, getTransactions, getBudgets } from '../api/index.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const cardStyle = { background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', transition:'all 0.2s ease' }
const cardHeader = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }
const cardTitle  = { fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:'#1a1a1a' }
const cardSub    = { fontSize:12, color:'#6b6b6b', marginTop:2 }

const DEMO_SUMMARY = { totalBalance:284500, income:95000, expenses:56240, savingsRate:40.8, healthScore:78 }
const DEMO_TX = [
  {icon:'🛒',name:'BigBasket',category:'Food',amount:-2840,date:'Today'},
  {icon:'💼',name:'Salary Credit',category:'Income',amount:95000,date:'Mar 1'},
  {icon:'🏠',name:'Rent Payment',category:'Housing',amount:-18000,date:'Mar 1'},
  {icon:'☕',name:'Starbucks',category:'Food',amount:-640,date:'Mar 14'},
  {icon:'📦',name:'Amazon',category:'Shopping',amount:-3200,date:'Mar 13'},
  {icon:'🚕',name:'Ola Ride',category:'Transport',amount:-340,date:'Mar 12'},
  {icon:'📱',name:'Netflix',category:'Subscriptions',amount:-649,date:'Mar 10'},
  {icon:'🍕',name:'Swiggy',category:'Food',amount:-870,date:'Mar 9'},
]
const DEMO_BUDGETS = [
  {name:'Housing / Rent',spent:18000,limit:20000,color:'#EC5677'},
  {name:'Food & Dining',spent:12400,limit:15000,color:'#B2D579'},
  {name:'Shopping',spent:8640,limit:8000,color:'#B91126'},
  {name:'Transport',spent:7200,limit:8000,color:'#EEBE0D'},
  {name:'Subscriptions',spent:4800,limit:5000,color:'#ADE6D5'},
]

function buildBarData(transactions) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push({ label: d.toLocaleString('default',{month:'short'}), month: d.getMonth(), year: d.getFullYear() })
  }
  const income   = months.map(m => transactions.filter(t => t.amount > 0 && new Date(t.date).getMonth()===m.month && new Date(t.date).getFullYear()===m.year).reduce((s,t)=>s+t.amount,0) || 0)
  const expenses = months.map(m => transactions.filter(t => t.amount < 0 && new Date(t.date).getMonth()===m.month && new Date(t.date).getFullYear()===m.year).reduce((s,t)=>s+Math.abs(t.amount),0) || 0)
  const savings  = income.map((inc,i) => Math.max(inc - expenses[i], 0))
  const hasData  = income.some(v=>v>0) || expenses.some(v=>v>0)
  if (!hasData) return null
  return {
    labels: months.map(m=>m.label),
    datasets: [
      { label:'Income',   data:income,   backgroundColor:'#B2D579', borderRadius:6 },
      { label:'Expenses', data:expenses, backgroundColor:'#EC5677', borderRadius:6 },
      { label:'Savings',  data:savings,  backgroundColor:'#EEBE0D', borderRadius:6 },
    ]
  }
}

const DEMO_BAR_DATA = {
  labels: ['Oct','Nov','Dec','Jan','Feb','Mar'],
  datasets: [
    { label:'Income',   data:[75000,80000,85000,88000,90000,95000], backgroundColor:'#B2D579', borderRadius:6 },
    { label:'Expenses', data:[48000,50000,54000,52000,54500,56240], backgroundColor:'#EC5677', borderRadius:6 },
    { label:'Savings',  data:[27000,30000,31000,36000,35500,38760], backgroundColor:'#EEBE0D', borderRadius:6 },
  ]
}

const barOptions = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ display:false } },
  scales:{
    x:{ ticks:{ color:'#AC9196', font:{size:11} }, grid:{ color:'rgba(0,0,0,0.04)' } },
    y:{ ticks:{ color:'#AC9196', font:{size:11}, callback: v=>'₹'+(v>=1000?(v/1000).toFixed(0)+'k':v) }, grid:{ color:'rgba(0,0,0,0.04)' } }
  }
}

const donutData = {
  labels:['Housing','Food','Transport','Subscriptions','Shopping','Other'],
  datasets:[{ data:[18000,12400,7200,4800,8640,5200], backgroundColor:['#EC5677','#B2D579','#EEBE0D','#ADE6D5','#D9FF2F','#D7A889'], borderWidth:2, borderColor:'#ffffff' }]
}
const donutOptions = {
  responsive:true, maintainAspectRatio:false, cutout:'72%',
  plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: ctx=>' ₹'+ctx.raw.toLocaleString('en-IN') } } }
}
const donutLegend = [
  {color:'#EC5677',label:'Housing ₹18,000'},{color:'#B2D579',label:'Food ₹12,400'},
  {color:'#EEBE0D',label:'Transport ₹7,200'},{color:'#ADE6D5',label:'Subs ₹4,800'},
  {color:'#D9FF2F',label:'Shopping ₹8,640'},{color:'#D7A889',label:'Other ₹5,200'},
]

export default function Dashboard() {
  const navigate     = useNavigate()
  const [summary,      setSummary]      = useState(null)
  const [transactions, setTransactions] = useState([])
  const [budgets,      setBudgets]      = useState([])
  const [chatOpen,     setChatOpen]     = useState(false)
  const [scoreAnim,    setScoreAnim]    = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [realBarData,  setRealBarData]  = useState(null)

  const user         = JSON.parse(localStorage.getItem('user') || '{}')
  const userName     = user.name || 'there'
  const currentMonth = selectedDate.toLocaleString('default', { month:'long', year:'numeric' })
  const today        = new Date()
  const isCurrentMonth = selectedDate.getMonth()===today.getMonth() && selectedDate.getFullYear()===today.getFullYear()
  const isFutureMonth  = selectedDate > new Date(today.getFullYear(), today.getMonth(), 1)
  const daysLeft       = new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1, 0).getDate() - today.getDate()

  function prevMonth() {
    setSelectedDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))
  }
  function nextMonth() {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1, 1)
    if (next <= new Date(2030, 11, 31)) setSelectedDate(next)
  }

  // Listen for AI chat open from sidebar
  useEffect(() => {
    const handler = () => setChatOpen(true)
    window.addEventListener('openChat', handler)
    return () => window.removeEventListener('openChat', handler)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [sumRes, txRes, budRes] = await Promise.all([
          getDashboardSummary(),
          getTransactions(),
          getBudgets(),
        ])
        setSummary(sumRes.data)
        setTransactions(txRes.data.slice(0,8))
        setBudgets(budRes.data)
        const built = buildBarData(txRes.data)
        setRealBarData(built)
        setTimeout(() => setScoreAnim(sumRes.data.healthScore || 78), 400)
      } catch {
        setSummary(DEMO_SUMMARY)
        setTransactions(DEMO_TX)
        setBudgets(DEMO_BUDGETS)
        setRealBarData(null)
        setTimeout(() => setScoreAnim(78), 400)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedDate])

  const dashboardContext = summary ? `
User: ${userName} — ${currentMonth}
Total Balance: ₹${summary.totalBalance?.toLocaleString('en-IN')}
Monthly Income: ₹${summary.income?.toLocaleString('en-IN')}
Monthly Expenses: ₹${summary.expenses?.toLocaleString('en-IN')}
Savings Rate: ${summary.savingsRate}%
Health Score: ${summary.healthScore}/100
` : ''

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#AC9196', fontSize:14 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:10 }}>💰</div>
        <div>Loading dashboard...</div>
      </div>
    </div>
  )

  const s = summary || DEMO_SUMMARY

  return (
    <div style={{ position:'relative', zIndex:1 }}>

      {/* Top Bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'#1a1a1a' }}>
            Good morning, {userName} 👋
          </h1>
          <p style={{ fontSize:13, color:'#6b6b6b', marginTop:3 }}>{currentMonth} · Financial Overview</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>

          {/* Month Navigator */}
          <div style={{ display:'flex', alignItems:'center', gap:2, background:'#f8f6f3', border:'1px solid rgba(0,0,0,0.08)', borderRadius:20, padding:'4px 6px', fontSize:12, color:'#6b6b6b' }}>
            <button onClick={prevMonth}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#6b6b6b', fontSize:16, lineHeight:1, padding:'2px 6px', borderRadius:8, transition:'all 0.15s' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.06)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}
            >‹</button>
            <span style={{ minWidth:110, textAlign:'center', fontWeight:500 }}>{currentMonth}</span>
            <button onClick={nextMonth}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#6b6b6b', fontSize:16, lineHeight:1, padding:'2px 6px', borderRadius:8, transition:'all 0.15s' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.06)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}
            >›</button>
          </div>

          <button onClick={() => setChatOpen(true)}
            style={{ background:'#EC5677', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer', boxShadow:'0 2px 12px rgba(236,86,119,0.3)', transition:'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.background='#d44a6a'}
            onMouseOut={e=>e.currentTarget.style.background='#EC5677'}
          >
            ✦ Ask AI Advisor
          </button>
        </div>
      </div>

      {/* Color strip */}
      <div style={{ display:'flex', height:3, borderRadius:20, overflow:'hidden', marginBottom:20, gap:1 }}>
        {['#EC5677','#B91126','#EEBE0D','#B2D579','#ADE6D5','#D9FF2F','#D7A889','#AC9196'].map(c=>(
          <div key={c} style={{ flex:1, background:c }} />
        ))}
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <MetricCard label="Total Balance"    value={`₹${s.totalBalance?.toLocaleString('en-IN')}`} change="8.4% vs last month" direction="up"   color="green" />
        <MetricCard label="Monthly Income"   value={`₹${s.income?.toLocaleString('en-IN')}`}        change="5.2% vs last month" direction="up"   color="gold"  />
        <MetricCard label="Monthly Expenses" value={`₹${s.expenses?.toLocaleString('en-IN')}`}      change="3.1% vs last month" direction="down" color="red"   />
        <MetricCard label="Savings Rate"     value={`${s.savingsRate}%`}                             change="2.1% vs last month" direction="up"   color="blue"  />
      </div>

      {/* Health Score */}
      <div style={{ display:'flex', alignItems:'center', gap:24, background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:'14px 20px', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontSize:10, color:'#AC9196', marginBottom:4, letterSpacing:'0.8px', textTransform:'uppercase', fontWeight:500 }}>Health Score</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:500, color:'#EC5677' }}>
            {s.healthScore}<span style={{ fontSize:13, color:'#AC9196' }}>/100</span>
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ background:'#f2f0ed', borderRadius:20, height:8, overflow:'hidden', marginBottom:5 }}>
            <div style={{ height:'100%', borderRadius:20, background:'linear-gradient(90deg,#EC5677,#EEBE0D,#B2D579)', width:scoreAnim+'%', transition:'width 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            {['Poor','Fair','Good','Excellent'].map(l=>(
              <span key={l} style={{ fontSize:10, color:'#AC9196' }}>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
          <div style={{ fontSize:11, color:'#4a8a2a', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#B2D579', display:'inline-block' }} />Savings rate 40%+
          </div>
          <div style={{ fontSize:11, color:'#1a6b5a', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#ADE6D5', display:'inline-block' }} />No high-interest debt
          </div>
          <div style={{ fontSize:11, color:'#7a5e00', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#EEBE0D', display:'inline-block' }} />Emergency fund: 3/6 months
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16, marginBottom:20 }}>
        <div style={cardStyle}
          onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
          onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
        >
          <div style={cardHeader}>
            <div><div style={cardTitle}>Income vs Expenses</div><div style={cardSub}>Last 6 months</div></div>
            <div style={{ fontSize:12, color:'#4a8a2a', fontWeight:500 }}>Net: +₹2,30,280</div>
          </div>
          <div style={{ display:'flex', gap:14, marginBottom:12 }}>
            {[{c:'#B2D579',l:'Income'},{c:'#EC5677',l:'Expenses'},{c:'#EEBE0D',l:'Savings'}].map(i=>(
              <div key={i.l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#6b6b6b' }}>
                <div style={{ width:10, height:10, borderRadius:2, background:i.c }} />{i.l}
              </div>
            ))}
          </div>
          {realBarData ? (
            <div style={{ position:'relative', height:200 }}><Bar data={realBarData} options={barOptions} /></div>
          ) : (
            <div style={{ position:'relative', height:200 }}>
              <Bar data={DEMO_BAR_DATA} options={barOptions} />
              <div style={{ position:'absolute', top:8, right:8, fontSize:10, color:'#AC9196', background:'#f8f6f3', padding:'3px 8px', borderRadius:10, border:'1px solid rgba(0,0,0,0.08)' }}>
                Demo data · Add transactions to see real data
              </div>
            </div>
          )}
        </div>

        <div style={cardStyle}
          onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
          onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
        >
          <div style={cardHeader}>
            <div><div style={cardTitle}>Spending</div><div style={cardSub}>This month</div></div>
          </div>
          <div style={{ position:'relative', height:150, width:150, margin:'0 auto 12px' }}>
            <Doughnut data={donutData} options={donutOptions} />
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:'#1a1a1a' }}>₹56,240</div>
              <div style={{ fontSize:9, color:'#AC9196' }}>total</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 8px' }}>
            {donutLegend.map(d=>(
              <div key={d.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#6b6b6b' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }} />{d.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={cardStyle}
          onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
          onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
        >
          <div style={cardHeader}>
            <div><div style={cardTitle}>Recent Transactions</div><div style={cardSub}>Last 7 days</div></div>
            <div onClick={()=>navigate('/transactions')} style={{ fontSize:12, color:'#EC5677', cursor:'pointer', fontWeight:500 }}>View all →</div>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#AC9196', fontSize:13 }}>
              No transactions yet —{' '}
              <span onClick={()=>navigate('/transactions')} style={{ color:'#EC5677', cursor:'pointer', fontWeight:500 }}>Add one</span>
            </div>
          ) : transactions.map((t,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:i<transactions.length-1?'1px solid rgba(0,0,0,0.05)':'none' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#f8f6f3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{t.icon||'💳'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{t.name}</div>
                <div style={{ fontSize:11, color:'#AC9196', marginTop:1 }}>{t.category} · {t.date}</div>
              </div>
              <div style={{ fontSize:13, fontWeight:500, color:t.amount>0?'#4a8a2a':'#B91126' }}>
                {t.amount>0?'+':'-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <div style={cardStyle}
          onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
          onMouseOut={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}
        >
          <div style={cardHeader}>
            <div><div style={cardTitle}>Budget Tracker</div><div style={cardSub}>{currentMonth}</div></div>
            <div style={{ fontSize:11, color:'#AC9196' }}>
              {isCurrentMonth ? `${daysLeft} days left` : isFutureMonth ? 'Future month' : 'Past month'}
            </div>
          </div>
          {budgets.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#AC9196', fontSize:13 }}>
              No budgets yet —{' '}
              <span onClick={()=>navigate('/budget')} style={{ color:'#EC5677', cursor:'pointer', fontWeight:500 }}>Add one</span>
            </div>
          ) : budgets.map((b,i)=>{
            const pct = Math.min((b.spent/b.limit)*100,100)
            const over = b.spent>b.limit
            return (
              <div key={i} style={{ marginBottom:11 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'#1a1a1a', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:b.color, display:'inline-block' }} />
                    {b.name}
                    {over && <span style={{ fontSize:9, color:'#B91126', background:'#B9112612', padding:'1px 5px', borderRadius:4, fontWeight:500 }}>Over</span>}
                  </span>
                  <span style={{ fontSize:11, color:'#AC9196' }}>₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ background:'#f2f0ed', borderRadius:20, height:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:20, background:over?'#B91126':b.color, width:pct+'%', transition:'width 1s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} dashboardContext={dashboardContext} />
    </div>
  )
}