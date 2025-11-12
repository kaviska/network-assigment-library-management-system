'use client'

import { useState, useEffect } from 'react'
import { apiService, Member } from '../services/apiService'

export default function MembersManager() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [newMember, setNewMember] = useState({
    memberId: '',
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    // Filter members based on search term
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredMembers(filtered)
  }, [members, searchTerm])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getAllMembers()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberDetails = async (memberId: string) => {
    try {
      const member = await apiService.getMemberById(memberId)
      // Show member details in an alert for now
      alert(`Member Details:\n\nID: ${member.memberId}\nName: ${member.name}\nEmail: ${member.email || 'N/A'}\nPhone: ${member.phone || 'N/A'}\nAddress: ${member.address || 'N/A'}\nRegistration Date: ${member.registrationDate}\nStatus: ${member.active ? 'Active' : 'Inactive'}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      alert(`Error fetching member details: ${errorMessage}`)
    }
  }

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!newMember.memberId.trim()) {
      setFormError('Member ID is required')
      return
    }
    if (!newMember.name.trim()) {
      setFormError('Name is required')
      return
    }

    try {
      setFormLoading(true)
      await apiService.addMember({
        memberId: newMember.memberId.trim(),
        name: newMember.name.trim(),
        email: newMember.email.trim() || undefined,
        phone: newMember.phone.trim() || undefined,
        address: newMember.address.trim() || undefined
      })

      // Reset form and close modal
      setNewMember({ memberId: '', name: '', email: '', phone: '', address: '' })
      setShowCreateForm(false)
      
      // Refresh members list
      await fetchMembers()
      
      alert('✅ Member added successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member'
      setFormError(errorMessage)
    } finally {
      setFormLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Library Members
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage member registrations and profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <span>➕</span>
            <span>Add Member</span>
          </button>
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={fetchMembers}
                  className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                >
                  🔄 Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="backdrop-blur-sm bg-white/90 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
          🔍 Search Members
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, member ID, or email..."
          className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 placeholder-gray-400"
        />
      </div>

      {/* Members List */}
      <div className="backdrop-blur-sm bg-white/90 shadow-xl overflow-hidden rounded-2xl border border-gray-200/50">
        <div className="px-6 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>👥</span>
            <span>All Members ({filteredMembers.length})</span>
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Browse and manage library members
          </p>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No members match your search criteria.' : 'No members found.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredMembers.map((member) => (
              <li key={member.memberId} className="px-6 py-5 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="shrink-0 transform hover:scale-110 transition-transform">
                      <div className="text-4xl bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                        {member.active ? '👤' : '�'}
                      </div>
                    </div>
                    <div className="ml-5 min-w-0 flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {member.name}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          member.active 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md' 
                            : 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-md'
                        }`}>
                          {member.active ? '✅ Active' : '⏸️ Inactive'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">
                          🆔 {member.memberId}
                        </p>
                        {member.email && (
                          <p className="text-sm text-gray-600">
                            📧 {member.email}
                          </p>
                        )}
                        {member.phone && (
                          <p className="text-sm text-gray-600">
                            📞 {member.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          📅 Registered: {new Date(member.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => fetchMemberDetails(member.memberId)}
                      className="group relative p-3 text-blue-500 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                      title="View details"
                    >
                      <span className="text-xl">👁️</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Member Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="text-4xl mr-4">✅</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-900 mb-2">
              Member Management Available
            </h3>
            <div className="text-sm text-purple-700">
              <p>You can now add new members using the "Add Member" button above. All fields except Member ID and Name are optional.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Member Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">👤</span>
                  <div>
                    <h3 className="text-2xl font-bold">Add New Member</h3>
                    <p className="text-purple-100 text-sm mt-1">Register a new library member</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormError(null)
                    setNewMember({ memberId: '', name: '', email: '', phone: '', address: '' })
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 transform hover:scale-110"
                  disabled={formLoading}
                >
                  <span className="text-2xl">✖️</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateMember} className="p-8">
              {formError && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-red-700 font-medium">{formError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Member ID */}
                <div>
                  <label htmlFor="memberId" className="block text-sm font-semibold text-gray-700 mb-2">
                    🆔 Member ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="memberId"
                    value={newMember.memberId}
                    onChange={(e) => setNewMember({ ...newMember, memberId: e.target.value })}
                    placeholder="Enter unique member ID"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email address (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    disabled={formLoading}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    📞 Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="Enter phone number (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    disabled={formLoading}
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    🏠 Address
                  </label>
                  <textarea
                    id="address"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    placeholder="Enter physical address (optional)"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    disabled={formLoading}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormError(null)
                    setNewMember({ memberId: '', name: '', email: '', phone: '', address: '' })
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>➕</span>
                      Add Member
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}