'use client'

import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import ItemsManager from './components/ItemsManager'
import MembersManager from './components/MembersManager'
import BorrowingManager from './components/BorrowingManager'
import AdminManager from './components/AdminManager'
import AdminChat from './components/AdminChat'

type ActiveTab = 'dashboard' | 'items' | 'members' | 'borrowings' | 'admins' | 'chat'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const { isAuthenticated, isLoading, admin, logout } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="text-6xl mb-6 animate-bounce">📚</div>
            <div className="absolute inset-0 blur-xl opacity-50 animate-pulse">📚</div>
          </div>
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading your library...
          </div>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: '📊' },
    { id: 'items' as ActiveTab, label: 'Library Items', icon: '📚' },
    { id: 'members' as ActiveTab, label: 'Members', icon: '👥' },
    { id: 'borrowings' as ActiveTab, label: 'Borrowings', icon: '📋' },
    { id: 'admins' as ActiveTab, label: 'Admin Management', icon: '👑' },
    { id: 'chat' as ActiveTab, label: 'Chat', icon: '💬' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'items':
        return <ItemsManager />
      case 'members':
        return <MembersManager />
      case 'borrowings':
        return <BorrowingManager />
      case 'admins':
        return <AdminManager />
      case 'chat':
        return admin ? <AdminChat adminId={admin.id.toString()} adminName={admin.name} /> : null
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl transform hover:scale-110 transition-transform">📚</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  OakTown Library
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="text-sm font-semibold text-gray-700">{admin?.name}</p>
              </div>
              <button
                onClick={logout}
                className="group relative px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <span>Logout</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation with Pills */}
      <nav className="sticky top-[72px] z-40 backdrop-blur-md bg-white/60 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with Animation */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
