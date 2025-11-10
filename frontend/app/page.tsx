'use client'

import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ItemsManager from './components/ItemsManager'
import MembersManager from './components/MembersManager'
import BorrowingManager from './components/BorrowingManager'

type ActiveTab = 'dashboard' | 'items' | 'members' | 'borrowings'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: '📊' },
    { id: 'items' as ActiveTab, label: 'Library Items', icon: '📚' },
    { id: 'members' as ActiveTab, label: 'Members', icon: '👥' },
    { id: 'borrowings' as ActiveTab, label: 'Borrowings', icon: '📋' },
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
                Welcome to the Library System
              </span>
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
