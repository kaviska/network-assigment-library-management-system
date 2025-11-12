'use client'

import { useState } from 'react'
import Link from 'next/link'
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

  // Show interface selection if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-3xl sm:text-4xl transform hover:scale-110 transition-transform">📚</div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  OakTown Library
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Management System</p>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Welcome to OakTown Library
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Access our comprehensive library management system. Choose your portal below to get started.
            </p>
          </div>

          {/* Interface Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Admin Portal */}
            <div className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">👑</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Admin Portal</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Comprehensive management system for library staff and administrators
                </p>
                
                {/* Feature List */}
                <div className="bg-gray-50/80 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <ul className="text-xs sm:text-sm text-gray-600 text-left space-y-1 sm:space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Manage library items and inventory</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Track member registrations and activity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Monitor borrowings and returns</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Handle administrative tasks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Real-time chat with members</span>
                    </li>
                  </ul>
                </div>
                
                <div className="transform transition-all duration-300 group-hover:scale-105">
                  <LoginForm />
                </div>
              </div>
            </div>

            {/* Member Portal */}
            <div className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">📖</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Member Portal</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Self-service portal for library members to explore and manage their account
                </p>
                
                {/* Feature List */}
                <div className="bg-gray-50/80 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <ul className="text-xs sm:text-sm text-gray-600 text-left space-y-1 sm:space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>Browse and search library collection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>View and track your borrowings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>Update your profile information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>Check borrowing history and fines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>Chat with library staff</span>
                    </li>
                  </ul>
                </div>
                
                <Link
                  href="/member"
                  className="group/btn inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Enter Member Portal</span>
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">System Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="group text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">Digital Catalog</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">Comprehensive book database</div>
              </div>
              <div className="group text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">Advanced Search</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">Smart filtering system</div>
              </div>
              <div className="group text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">Real-time Chat</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">Instant communication</div>
              </div>
              <div className="group text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">Analytics</div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">Detailed insights</div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200/50">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Need Help Getting Started?</h4>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Our library management system is designed to be intuitive and easy to use. Whether you're an admin or member, you'll find everything you need in just a few clicks.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">📞</span>
                  <span>Call: (555) 123-LIBRARY</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-blue-500">✉️</span>
                  <span>Email: help@oaktown-library.org</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/60 backdrop-blur-md border-t border-gray-200/50 mt-12 sm:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-1">
                <p className="text-gray-600 text-sm sm:text-base">
                  &copy; 2024 OakTown Library Management System.
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  All rights reserved.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-1 mt-2">
                <p className="text-xs sm:text-sm text-gray-500">
                  Built with Next.js and Java Spring Boot
                </p>
                <span className="hidden sm:inline text-gray-400">•</span>
                <p className="text-xs sm:text-sm text-gray-500">
                  Powered by modern web technologies
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
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
