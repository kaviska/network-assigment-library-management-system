'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Admin {
  id: number
  email: string
  name: string
  createdDate: string
  lastLogin: string | null
  active: boolean
}

export default function AdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: '',
  })

  const { token } = useAuth()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/auth/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
        setError('')
      } else {
        setError('Failed to fetch admins')
      }
    } catch (error) {
      setError('Error fetching admins')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreateLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/auth/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewAdmin({ email: '', password: '', name: '' })
        fetchAdmins() // Refresh the list
      } else {
        const errorText = await response.text()
        setError(errorText || 'Failed to create admin')
      }
    } catch (error) {
      setError('Error creating admin')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleStatus = async (adminId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (response.ok) {
        fetchAdmins() // Refresh the list
      } else {
        const errorText = await response.text()
        setError(errorText || 'Failed to update admin status')
      }
    } catch (error) {
      setError('Error updating admin status')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage administrator accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
        >
          <span>➕</span>
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-900">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fadeIn transform scale-100">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewAdmin({ email: '', password: '', name: '' })
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create New Admin
              </h3>
              <p className="text-sm text-gray-500 mt-2">Add a new administrator to the system</p>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  disabled={createLoading}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  disabled={createLoading}
                  placeholder="admin@oaktown.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={6}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  disabled={createLoading}
                  placeholder="Min 6 chars, 1 upper, 1 lower, 1 digit/special"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewAdmin({ email: '', password: '', name: '' })
                    setError('')
                  }}
                  className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {createLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    '✨ Create Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="backdrop-blur-sm bg-white/90 shadow-xl overflow-hidden rounded-2xl border border-gray-200/50">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>👥</span>
            <span>Administrator Accounts ({admins.length})</span>
          </h3>
        </div>
        
        {admins.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">No administrators found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <li key={admin.id} className="px-6 py-5 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="shrink-0">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform ${
                        admin.active 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                          : 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                      }`}>
                        👤
                      </div>
                    </div>
                    <div className="ml-5 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-base font-bold text-gray-900">{admin.name}</p>
                        {!admin.active && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-md">
                            ⏸️ Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">📧 {admin.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        🗓️ Created: {formatDate(admin.createdDate)} • 🔑 Last Login: {formatDate(admin.lastLogin)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.active)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                        admin.active
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {admin.active ? '🔴 Deactivate' : '✅ Activate'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}