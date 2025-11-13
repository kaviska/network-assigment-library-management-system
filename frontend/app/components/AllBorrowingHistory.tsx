'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'

interface BorrowingRecord {
  isbn: string
  title: string
  author: string
  itemType: string
  memberId: string
  memberName: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: string
  dailyCost: number
  totalCost?: number
}

export default function AllBorrowingHistory() {
  const { token, isAuthenticated } = useAuth()
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [error, setError] = useState('')

  const fetchAllBorrowingHistory = useCallback(async () => {
    if (!token) {
      setError('Authentication required')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      console.log('Fetching all borrowing history...')
      
      const borrowingData = await apiService.getAllBorrowingHistory(token)
      
      console.log('Received all borrowing data:', borrowingData)
      
      setBorrowings(borrowingData)
    } catch (error) {
      console.error('Error fetching all borrowing history:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch borrowing history')
      setBorrowings([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllBorrowingHistory()
    }
  }, [isAuthenticated, token, fetchAllBorrowingHistory])

  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filter by status
    const statusMatch = filter === 'all' || borrowing.status.toLowerCase() === filter.toLowerCase()
    
    // Filter by search term (title, author, member name, or ISBN)
    const searchMatch = searchTerm === '' || 
      borrowing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by selected member
    const memberMatch = selectedMember === '' || borrowing.memberId === selectedMember
    
    return statusMatch && searchMatch && memberMatch
  })

  const getUniqueMembers = () => {
    const uniqueMembers = Array.from(new Set(borrowings.map(b => b.memberId)))
      .map(id => {
        const borrowing = borrowings.find(b => b.memberId === id)
        return {
          id,
          name: borrowing?.memberName || 'Unknown'
        }
      })
    return uniqueMembers.sort((a, b) => a.name.localeCompare(b.name))
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BORROWED':
        return '📖'
      case 'RETURNED':
        return '✅'
      case 'OVERDUE':
        return '⚠️'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BORROWED':
        return 'bg-blue-100 text-blue-800'
      case 'RETURNED':
        return 'bg-green-100 text-green-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate statistics
  const stats = {
    uniqueMembers: new Set(borrowings.map(b => b.memberId)).size,
    totalCost: 0,
    averageBorrowingPeriod: 0
  }

  borrowings.forEach(borrowing => {
    if (borrowing.totalCost) {
      stats.totalCost += borrowing.totalCost
    }
  })

  const summaryStats = {
    total: borrowings.length,
    borrowed: borrowings.filter(b => b.status === 'BORROWED').length,
    returned: borrowings.filter(b => b.status === 'RETURNED').length,
    overdue: borrowings.filter(b => b.status === 'OVERDUE').length,
    ...stats
  }

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in as an admin to view borrowing history.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">📋</div>
          <p className="text-gray-600">Loading borrowing history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllBorrowingHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Members Borrowing History</h2>
        <p className="text-gray-600">Complete borrowing history for all library members</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.total}</div>
          <div className="text-sm text-blue-700">Total Records</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{summaryStats.returned}</div>
          <div className="text-sm text-green-700">Returned</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{summaryStats.borrowed}</div>
          <div className="text-sm text-yellow-700">Currently Borrowed</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{summaryStats.uniqueMembers}</div>
          <div className="text-sm text-purple-700">Active Members</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'borrowed', 'returned', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors capitalize
                  ${filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by title, author, member name, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Member Filter */}
          <div>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Members</option>
              {getUniqueMembers().map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredBorrowings.length} of {borrowings.length} records
      </div>

      {/* Borrowing Records */}
      {filteredBorrowings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No borrowing records available.' 
              : `No ${filter} records match your search criteria.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBorrowings.map((borrowing, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{getStatusIcon(borrowing.status)}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{borrowing.title}</div>
                        <div className="text-sm text-gray-600">by {borrowing.author}</div>
                        <div className="text-xs text-gray-500">
                          {borrowing.itemType} • ISBN: {borrowing.isbn}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{borrowing.memberName}</div>
                    <div className="text-sm text-gray-600">ID: {borrowing.memberId}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div><strong>Borrowed:</strong> {formatDate(borrowing.borrowDate)}</div>
                      {borrowing.dueDate && (
                        <div><strong>Due:</strong> {formatDate(borrowing.dueDate)}</div>
                      )}
                      {borrowing.returnDate && (
                        <div><strong>Returned:</strong> {formatDate(borrowing.returnDate)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                      {borrowing.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div><strong>Daily:</strong> {formatCurrency(borrowing.dailyCost)}</div>
                      {borrowing.totalCost && (
                        <div><strong>Total:</strong> {formatCurrency(borrowing.totalCost)}</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}