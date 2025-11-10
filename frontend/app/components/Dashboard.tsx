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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Connection Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={fetchStats}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Library Dashboard</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats?.totalItems || 0}
          icon="📚"
          color="bg-blue-500"
        />
        <StatCard
          title="Available Items"
          value={stats?.availableItems || 0}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Borrowed Items"
          value={stats?.borrowedItems || 0}
          icon="📤"
          color="bg-orange-500"
        />
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon="👥"
          color="bg-purple-500"
        />
      </div>

      {/* Item Types Breakdown */}
      {stats && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Item Types Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ItemTypeCard
                title="Books"
                value={stats.books || 0}
                icon="📖"
                color="text-blue-600"
              />
              <ItemTypeCard
                title="Reference Books"
                value={stats.referenceBooks || 0}
                icon="📕"
                color="text-red-600"
              />
              <ItemTypeCard
                title="Magazines"
                value={stats.magazines || 0}
                icon="📰"
                color="text-green-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
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

function StatCard({ title, value, icon, color }: {
  title: string
  value: number
  icon: string
  color: string
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className={`${color} rounded-md p-3`}>
              <span className="text-2xl text-white">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemTypeCard({ title, value, icon, color }: {
  title: string
  value: number
  icon: string
  color: string
}) {
  return (
    <div className="text-center">
      <div className={`text-3xl ${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
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
      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </button>
  )
}