import React, { useState } from 'react'

const colorMap = {
  green: { accent:'#B2D579', light:'#B2D57915', text:'#4a6b1a' },
  gold:  { accent:'#EEBE0D', light:'#EEBE0D15', text:'#7a5e00' },
  red:   { accent:'#EC5677', light:'#EC567715', text:'#B91126' },
  blue:  { accent:'#ADE6D5', light:'#ADE6D515', text:'#1a6b5a' },
}

export default function MetricCard({ label, value, change, direction, color }) {
  const { accent, light, text } = colorMap[color] || colorMap.green
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? light : '#ffffff',
        border: `1px solid ${hovered ? accent : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 14,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease both',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${accent}25` : '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'default',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent, borderRadius:'14px 14px 0 0', opacity: hovered ? 1 : 0.5, transition:'opacity 0.2s' }} />
      <div style={{ fontSize:10, color:'#AC9196', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:10, fontWeight:500 }}>{label}</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:500, marginBottom:6, color:'#1a1a1a' }}>{value}</div>
      <div style={{ fontSize:12, display:'flex', alignItems:'center', gap:4, color: direction==='up' ? '#4a8a2a' : '#B91126', fontWeight:500 }}>
        <span>{direction==='up' ? '↑' : '↓'}</span>
        {change}
      </div>
    </div>
  )
}