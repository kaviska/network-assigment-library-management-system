'use client'

import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import ItemsManager from './components/ItemsManager'
import MembersManager from './components/MembersManager'
import BorrowingManager from './components/BorrowingManager'
import AdminManager from './components/AdminManager'

type ActiveTab = 'dashboard' | 'items' | 'members' | 'borrowings' | 'admins'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const { isAuthenticated, isLoading, admin, logout } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-xl text-gray-600">Loading...</div>
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
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📚 OakTown Library Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {admin?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
