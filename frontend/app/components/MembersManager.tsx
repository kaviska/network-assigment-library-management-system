'use client'

import { useState, useEffect } from 'react'
import { apiService, Member } from '../services/apiService'

export default function MembersManager() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Library Members</h2>
        <button
          onClick={fetchMembers}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={fetchMembers}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Members
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, member ID, or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            All Members ({filteredMembers.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Browse and manage library members
          </p>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            {searchTerm ? 'No members match your search criteria.' : 'No members found.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <li key={member.memberId} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="shrink-0">
                      <span className="text-2xl">
                        {member.active ? '👤' : '👥'}
                      </span>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          ID: {member.memberId}
                        </p>
                        {member.email && (
                          <p className="text-sm text-gray-500">
                            📧 {member.email}
                          </p>
                        )}
                        {member.phone && (
                          <p className="text-sm text-gray-500">
                            📞 {member.phone}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          Registered: {new Date(member.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchMemberDetails(member.memberId)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="View details"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Member Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Managing Members
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>To add new members or update member information, please use the console application or contact your system administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}