// Main layout - wraps every page with sidebar and topbar
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import '../styles/Layout.css'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Topbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {children}
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
    </div>
  )
}
