import React, { useState } from 'react'

const AVATARS = {
  f1:  { src:'/avatars/f1.jpg',  label:'Dark Vibes'   },
  f2:  { src:'/avatars/f2.jpg',  label:'Moody Girl'   },
  f3:  { src:'/avatars/f3.jpg',  label:'Black Outfit' },
  f4:  { src:'/avatars/f4.jpg',  label:'Cool Girl'    },
  f5:  { src:'/avatars/f5.jpg',  label:'Cat Cafe'     },
  f6:  { src:'/avatars/f6.jpg',  label:'Coder Girl'   },
  f7:  { src:'/avatars/f7.jpg',  label:'Office Girl'  },
  f8:  { src:'/avatars/f8.jpg',  label:'Money Boss'   },
  f10: { src:'/avatars/f10.jpg', label:'Anime Girl'   },
  m1:  { src:'/avatars/m1.jpg',  label:'White Hair'   },
  m2:  { src:'/avatars/m2.jpg',  label:'Cool Boy'     },
  m3:  { src:'/avatars/m3.jpg',  label:'Dark Boy'     },
  m4:  { src:'/avatars/m4.jpg',  label:'Chibi Boy'    },
  m5:  { src:'/avatars/m5.jpg',  label:'Cat Boy'      },
  m6:  { src:'/avatars/m6.jpg',  label:'Green Boy'    },
  m7:  { src:'/avatars/m7.jpg',  label:'Selfie Boy'   },
  m8:  { src:'/avatars/m8.jpg',  label:'Cap Boy'      },
  o1:  { src:'/avatars/o1.jpg',  label:'Panda Coder'  },
  o2:  { src:'/avatars/o2.jpg',  label:'Cat Lover'    },
  o3:  { src:'/avatars/o3.jpg',  label:'Soft Vibes'   },
}

export default function ChibiAvatar({ avatarId, size = 40, showLabel = false }) {
  const av      = AVATARS[avatarId] || AVATARS['f1']
  const [err, setErr] = useState(false)

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{
        width:  size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#EC5677,#EEBE0D)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: `0 0 ${size/3}px rgba(236,86,119,0.5)`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        border: '2px solid rgba(236,86,119,0.4)',
        flexShrink: 0,
      }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = `0 0 ${size/2}px rgba(236,86,119,0.8)`
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = `0 0 ${size/3}px rgba(236,86,119,0.5)`
        }}
      >
        {!err ? (
          <img
            src={av.src}
            alt={av.label}
            onError={() => setErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
          />
        ) : (
          <span style={{ fontSize: size * 0.4 }}>👤</span>
        )}
      </div>
      {showLabel && (
        <span style={{ fontSize:10, color:'#AC9196', textAlign:'center' }}>{av.label}</span>
      )}
    </div>
  )
}