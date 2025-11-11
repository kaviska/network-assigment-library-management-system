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
        <div className="text-lg">Loading admins...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Admin
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    disabled={createLoading}
                    placeholder="Min 6 chars, 1 upper, 1 lower, 1 digit/special"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewAdmin({ email: '', password: '', name: '' })
                      setError('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <li key={admin.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                      admin.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      👤
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                      {!admin.active && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <p className="text-xs text-gray-400">
                      Created: {formatDate(admin.createdDate)} | Last Login: {formatDate(admin.lastLogin)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(admin.id, admin.active)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      admin.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {admin.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {admins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No admins found.</p>
          </div>
        )}
      </div>
    </div>
  )
}