import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './navbar/Navbar'
import Footer from './footer/Footer'

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content" style={{ marginTop: '60px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
