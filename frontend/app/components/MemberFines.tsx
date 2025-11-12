'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'

interface Fine {
  id: number
  memberId: string
  borrowingId: number
  amount: number
  reason: string
  dateIssued: string
  datePaid?: string
  status: 'PENDING' | 'PAID' | 'WAIVED'
  bookTitle: string
  isbn: string
}

interface MemberFinesProps {
  memberId: string
}

export default function MemberFines({ memberId }: MemberFinesProps) {
  const [fines, setFines] = useState<Fine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMemberFines()
  }, [memberId])

  const fetchMemberFines = async () => {
    try {
      // Since the API doesn't have fines endpoint yet, we'll simulate some data
      // In a real implementation, you would call apiService.getMemberFines(memberId)
      
      // Mock data for demonstration
      const mockFines: Fine[] = [
        {
          id: 1,
          memberId,
          borrowingId: 101,
          amount: 1.50,
          reason: 'Late return - 3 days overdue',
          dateIssued: '2024-10-06',
          status: 'PAID',
          datePaid: '2024-10-08',
          bookTitle: 'A Game of Thrones',
          isbn: '978-0-553-21311-7'
        },
        {
          id: 2,
          memberId,
          borrowingId: 102,
          amount: 5.00,
          reason: 'Damaged book cover',
          dateIssued: '2024-11-01',
          status: 'PENDING',
          bookTitle: 'The Great Gatsby',
          isbn: '978-0-7432-7356-5'
        }
      ]

      setFines(mockFines)
    } catch (error) {
      console.error('Error fetching fines:', error)
      setFines([])
    } finally {
      setIsLoading(false)
    }
  }



  const filteredFines = fines.filter(fine => {
    if (filter === 'all') return true
    return fine.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '💳'
      case 'PAID':
        return '✅'
      case 'WAIVED':
        return '🎁'
      default:
        return '💰'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'WAIVED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalPendingFines = fines
    .filter(fine => fine.status === 'PENDING')
    .reduce((sum, fine) => sum + fine.amount, 0)

  const totalPaidFines = fines
    .filter(fine => fine.status === 'PAID')
    .reduce((sum, fine) => sum + fine.amount, 0)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">💰</div>
          <p className="text-gray-600">Loading your fines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Fines & Payments</h2>
        <p className="text-gray-600">Track and manage your library fines and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">${totalPendingFines.toFixed(2)}</div>
          <div className="text-sm text-red-700">Outstanding Fines</div>
          <div className="text-xs text-red-600 mt-1">
            {fines.filter(f => f.status === 'PENDING').length} pending fine(s)
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">${totalPaidFines.toFixed(2)}</div>
          <div className="text-sm text-green-700">Total Paid</div>
          <div className="text-xs text-green-600 mt-1">
            {fines.filter(f => f.status === 'PAID').length} payment(s) made
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            ${fines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-blue-700">Total Fines</div>
          <div className="text-xs text-blue-600 mt-1">
            {fines.length} fine(s) in history
          </div>
        </div>
      </div>

      {/* Outstanding Fines Information */}
      {totalPendingFines > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Outstanding Balance</h3>
              <p className="text-red-700">
                You have ${totalPendingFines.toFixed(2)} in pending fines. Please visit the library to make payment.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">${totalPendingFines.toFixed(2)}</div>
              <div className="text-sm text-red-700">Total Due</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'waived'].map((status) => (
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

      {/* Fines List */}
      {filteredFines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">
            {filter === 'all' ? '🎉' : filter === 'pending' ? '💳' : '✅'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' 
              ? 'No fines on record' 
              : filter === 'pending'
              ? 'No pending fines'
              : `No ${filter} fines`
            }
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Great! You have a clean record with no library fines.' 
              : filter === 'pending'
              ? 'All your fines have been paid. Keep up the good work!'
              : `You have no ${filter} fines at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFines.map((fine) => (
            <div
              key={fine.id}
              className={`
                border rounded-lg p-4 transition-all duration-200 hover:shadow-md
                ${fine.status === 'PENDING' 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{getStatusIcon(fine.status)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{fine.bookTitle}</h3>
                      <p className="text-sm text-gray-600">ISBN: {fine.isbn}</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium mt-1 ${getStatusColor(fine.status)}`}>
                        {fine.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <div className="font-medium text-lg">${fine.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Date Issued:</span>
                      <div className="font-medium">{formatDate(fine.dateIssued)}</div>
                    </div>
                    {fine.datePaid && (
                      <div>
                        <span className="text-gray-500">Date Paid:</span>
                        <div className="font-medium">{formatDate(fine.datePaid)}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Borrowing ID:</span>
                      <div className="font-medium">#{fine.borrowingId}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-medium text-gray-700">Reason: </span>
                    <span className="text-sm text-gray-600">{fine.reason}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Fine Information:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Fines must be paid at the library front desk</li>
          <li>• Cash and card payments are accepted at the library</li>
          <li>• Late return fines: $0.50 per day</li>
          <li>• Damaged item fees vary based on replacement cost</li>
          <li>• Contact library staff for payment arrangements or questions</li>
          <li>• Library hours: Monday-Friday 9 AM - 6 PM, Saturday 10 AM - 4 PM</li>
        </ul>
      </div>
    </div>
  )
}