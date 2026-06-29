import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Login from './pages/Login'
import Register from './pages/Register'
import Goals from './pages/Goals'
import ResetPassword from './pages/ResetPassword'
import Particles from './components/Particles'
import GradientBg from './components/GradientBg'

const pageVariants = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -20 },
}

const pageTransition = {
  duration: 0.4,
  ease: 'easeInOut',
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width:'100%' }}
    >
      {children}
    </motion.div>
  )
}

function AppLayout({ children }) {
  return (
    <div style={{ display:'flex', position:'relative', zIndex:1 }}>
      <Sidebar />
      <main style={{ marginLeft:230, flex:1, padding:'32px 36px', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public routes */}
        <Route path="/login" element={
          <AnimatedPage><Login /></AnimatedPage>
        } />
        <Route path="/register" element={
          <AnimatedPage><Register /></AnimatedPage>
        } />
        <Route path="/reset-password/:token" element={
          <AnimatedPage><ResetPassword /></AnimatedPage>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <AnimatedPage><Dashboard /></AnimatedPage>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <AppLayout>
              <AnimatedPage><Transactions /></AnimatedPage>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <AppLayout>
              <AnimatedPage><Budget /></AnimatedPage>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <AppLayout>
              <AnimatedPage><Goals /></AnimatedPage>
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Default */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/login"     replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GradientBg />
      <Particles />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a0028',
            color: '#ffe8f5',
            border: '1px solid rgba(255,77,166,0.3)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            backdropFilter: 'blur(10px)',
          },
        }}
      />

      <AnimatedRoutes />
    </BrowserRouter>
  )
}