'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'

interface BorrowingRecord {
  id: number
  isbn: string
  title: string
  author: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  itemType: string
}

interface BorrowingHistoryProps {
  memberId: string
}

export default function BorrowingHistory({ memberId }: BorrowingHistoryProps) {
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingRecord | null>(null)

  useEffect(() => {
    fetchBorrowingHistory()
  }, [memberId])

  const fetchBorrowingHistory = async () => {
    try {
      setIsLoading(true)
      
      console.log('Fetching borrowing history for member:', memberId)
      
      // Fetch real borrowing history from the API
      const borrowingData = await apiService.getBorrowingHistory(memberId)
      
      console.log('Received borrowing data:', borrowingData)
      
      // Transform the data from the API to match our component interface
      const transformedBorrowings: BorrowingRecord[] = borrowingData.map((item: any, index: number) => ({
        id: index + 1, // Since API doesn't return ID, use index
        isbn: item.isbn,
        title: item.title,
        author: item.author,
        borrowDate: item.borrowDate, // API returns LocalDate format
        dueDate: '', // API doesn't return due date for returned items
        returnDate: item.returnDate, // API returns LocalDate format
        status: 'RETURNED' as const, // API only returns returned items
        itemType: 'Book' // Default to Book since API doesn't specify type
      }))

      setBorrowings(transformedBorrowings)
    } catch (error) {
      console.error('Error fetching borrowing history:', error)
      setBorrowings([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }



  const filteredBorrowings = borrowings.filter(borrowing => {
    if (filter === 'all') return true
    return borrowing.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
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
    switch (status) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const totalCurrentFines = 0

  const currentBorrowings = borrowings.filter(b => b.status === 'BORROWED' || b.status === 'OVERDUE')

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">📋</div>
          <p className="text-gray-600">Loading your borrowing history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Borrowings</h2>
        <p className="text-gray-600">Track your current and past book borrowings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{currentBorrowings.length}</div>
          <div className="text-sm text-blue-700">Current Borrowings</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {borrowings.filter(b => b.status === 'RETURNED').length}
          </div>
          <div className="text-sm text-green-700">Returned Books</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {borrowings.filter(b => b.status === 'OVERDUE').length}
          </div>
          <div className="text-sm text-red-700">Overdue Books</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-orange-700">Days Overdue</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'borrowed', 'overdue', 'returned'].map((status) => (
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

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No borrowing history' : `No ${filter} borrowings`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Start browsing our collection to borrow your first book!' 
              : `You have no ${filter} borrowings at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBorrowings.map((borrowing) => (
            <div
              key={borrowing.id}
              className={`
                border rounded-lg p-4 transition-all duration-200 hover:shadow-md
                ${borrowing.status === 'OVERDUE' 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{getStatusIcon(borrowing.status)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{borrowing.title}</h3>
                      <p className="text-sm text-gray-600">by {borrowing.author}</p>
                      <p className="text-xs text-gray-500">ISBN: {borrowing.isbn}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                      {borrowing.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Borrowed:</span>
                      <div className="font-medium">{formatDate(borrowing.borrowDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Due Date:</span>
                      <div className="font-medium">{formatDate(borrowing.dueDate)}</div>
                    </div>
                    {borrowing.returnDate && (
                      <div>
                        <span className="text-gray-500">Returned:</span>
                        <div className="font-medium">{formatDate(borrowing.returnDate)}</div>
                      </div>
                    )}
                  </div>

                  {borrowing.status === 'BORROWED' && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        {calculateDaysRemaining(borrowing.dueDate) > 0
                          ? `${calculateDaysRemaining(borrowing.dueDate)} days remaining`
                          : `Overdue by ${Math.abs(calculateDaysRemaining(borrowing.dueDate))} days`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
