'use client'

import { useState, useEffect } from 'react'
import { apiService, LibraryStats } from '../services/apiService'

export default function Dashboard() {
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getLibraryStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute top-0 left-0 h-16 w-16 border-t-4 border-b-4 border-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-4xl">🚨</span>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-red-900">
              Connection Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={fetchStats}
                className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔄 Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Library Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Statistics Cards with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats?.totalItems || 0}
          icon="📚"
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Available Items"
          value={stats?.availableItems || 0}
          icon="✅"
          gradient="from-green-500 to-emerald-500"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Borrowed Items"
          value={stats?.borrowedItems || 0}
          icon="📤"
          gradient="from-orange-500 to-amber-500"
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon="👥"
          gradient="from-purple-500 to-pink-500"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Item Types Breakdown */}
      {stats && (
        <div className="backdrop-blur-sm bg-white/90 overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📊</span>
              <span>Item Types Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ItemTypeCard
                title="Books"
                value={stats.books || 0}
                icon="📖"
                gradient="from-blue-500 to-cyan-500"
              />
              <ItemTypeCard
                title="Reference Books"
                value={stats.referenceBooks || 0}
                icon="📕"
                gradient="from-red-500 to-rose-500"
              />
              <ItemTypeCard
                title="Magazines"
                value={stats.magazines || 0}
                icon="📰"
                gradient="from-green-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="backdrop-blur-sm bg-white/90 overflow-hidden shadow-xl rounded-2xl border border-gray-200/50">
        <div className="px-6 py-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              title="View All Items"
              icon="📚"
              onClick={() => {/* Navigate to items */}}
            />
            <QuickActionButton
              title="View Members"
              icon="👥"
              onClick={() => {/* Navigate to members */}}
            />
            <QuickActionButton
              title="New Borrowing"
              icon="📋"
              onClick={() => {/* Navigate to borrowings */}}
            />
            <QuickActionButton
              title="Refresh Stats"
              icon="🔄"
              onClick={fetchStats}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, gradient, iconBg }: {
  title: string
  value: number
  icon: string
  gradient: string
  iconBg: string
}) {
  return (
    <div className="group relative backdrop-blur-sm bg-white/90 overflow-hidden shadow-lg hover:shadow-2xl rounded-2xl border border-gray-200/50 transition-all duration-300 transform hover:scale-105">
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {title}
            </p>
            <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>
          <div className={`${iconBg} rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-4xl">{icon}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>
    </div>
  )
}

function ItemTypeCard({ title, value, icon, gradient }: {
  title: string
  value: number
  icon: string
  gradient: string
}) {
  return (
    <div className="relative group">
      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-105">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
      </div>
    </div>
  )
}

function QuickActionButton({ title, icon, onClick }: {
  title: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-200 hover:border-blue-300"
    >
      <span className="text-4xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
        {icon}
      </span>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
        {title}
      </span>
    </button>
  )
}