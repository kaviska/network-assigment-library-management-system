'use client'

import { useState, useEffect } from 'react'
import MemberProfile from '../components/MemberProfile'
import MemberBooks from '../components/MemberBooks'
import MemberChat from '../components/MemberChat'
import BorrowingHistory from '../components/BorrowingHistory'
import MemberFines from '../components/MemberFines'

type ActiveTab = 'profile' | 'books' | 'borrowings' | 'fines' | 'chat'

export default function MemberPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile')
  const [memberData, setMemberData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get member data from localStorage or prompt for member ID
  useEffect(() => {
    const savedMemberId = localStorage.getItem('currentMemberId')
    const savedMemberData = localStorage.getItem('currentMemberData')
    
    if (savedMemberId && savedMemberData) {
      setMemberData(JSON.parse(savedMemberData))
      setIsLoading(false)
    } else {
      // Prompt for member ID
      const memberId = prompt('Please enter your Member ID:')
      if (memberId) {
        fetchMemberData(memberId)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  const fetchMemberData = async (memberId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${memberId}`)
      if (response.ok) {
        const data = await response.json()
        setMemberData(data)
        localStorage.setItem('currentMemberId', memberId)
        localStorage.setItem('currentMemberData', JSON.stringify(data))
      } else {
        alert('Member not found. Please check your Member ID.')
      }
    } catch (error) {
      console.error('Error fetching member data:', error)
      alert('Error connecting to server. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentMemberId')
    localStorage.removeItem('currentMemberData')
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="text-6xl mb-6 animate-bounce">📚</div>
            <div className="absolute inset-0 blur-xl opacity-50 animate-pulse">📚</div>
          </div>
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading your profile...
          </div>
        </div>
      </div>
    )
  }

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Member Access Required</h2>
          <p className="text-gray-600 mb-6">Please enter your Member ID to access your library account.</p>
          <button
            onClick={() => {
              const memberId = prompt('Please enter your Member ID:')
              if (memberId) {
                setIsLoading(true)
                fetchMemberData(memberId)
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Enter Member ID
          </button>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'profile' as ActiveTab, label: 'My Profile', icon: '👤' },
    { id: 'books' as ActiveTab, label: 'Browse Books', icon: '📚' },
    { id: 'borrowings' as ActiveTab, label: 'My Borrowings', icon: '📋' },
    { id: 'fines' as ActiveTab, label: 'Fines & Payments', icon: '💰' },
    { id: 'chat' as ActiveTab, label: 'Chat with Admin', icon: '💬' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <MemberProfile memberData={memberData} onUpdate={setMemberData} />
      case 'books':
        return <MemberBooks memberId={memberData.memberId} />
      case 'borrowings':
        return <BorrowingHistory memberId={memberData.memberId} />
      case 'fines':
        return <MemberFines memberId={memberData.memberId} />
      case 'chat': {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams({
        memberId: memberData.memberId,
        memberName: memberData.name,
          }).toString()
          window.location.href = `/member-chat`
        }
        return null
      }
      default:
        return <MemberProfile memberData={memberData} onUpdate={setMemberData} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl transform hover:scale-110 transition-transform">📚</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  OakTown Library
                </h1>
                <p className="text-xs text-gray-500">Member Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Welcome,</p>
                <p className="text-sm font-semibold text-gray-700">{memberData.name}</p>
              </div>
              <button
                onClick={handleLogout}
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

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative py-4 px-2 text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeTab === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg backdrop-blur-md border border-gray-200/50 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
