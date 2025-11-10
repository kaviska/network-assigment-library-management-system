'use client'

import { useState } from 'react'
import { apiService } from '../services/apiService'

export default function BorrowingManager() {
  const [activeSection, setActiveSection] = useState<'info' | 'borrow' | 'return'>('info')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Borrowing Management</h2>
      </div>

      {/* Section Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4">
            <button
              onClick={() => setActiveSection('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Information
            </button>
            <button
              onClick={() => setActiveSection('borrow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'borrow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📤 Borrow Item
            </button>
            <button
              onClick={() => setActiveSection('return')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'return'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📥 Return Item
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'info' && <BorrowingInfo />}
          {activeSection === 'borrow' && <BorrowForm />}
          {activeSection === 'return' && <ReturnForm />}
        </div>
      </div>
    </div>
  )
}

function BorrowingInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Borrowing Information</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                About Borrowing System
              </h4>
              <div className="mt-2 text-sm text-blue-700 space-y-2">
                <p>The OakTown Library borrowing system manages the lending of library items to registered members.</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Books can be borrowed for up to 14 days</li>
                  <li>Magazines can be borrowed for up to 7 days</li>
                  <li>Reference books are restricted and cannot be borrowed</li>
                  <li>Daily costs apply: Books $0.50/day, Magazines $0.25/day, Reference Books $1.00/day</li>
                  <li>Members must be active to borrow items</li>
                  <li>Items must be available (not currently borrowed)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">How to Borrow</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Ensure the member is registered and active</li>
            <li>Check that the item is available</li>
            <li>Use the console application to process the borrowing</li>
            <li>The system will calculate costs and update availability</li>
            <li>A borrowing record will be created with due date</li>
          </ol>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">How to Return</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Locate the borrowed item in the system</li>
            <li>Use the console application to process the return</li>
            <li>The system will calculate total costs</li>
            <li>The item will be marked as available</li>
            <li>The borrowing record will be updated</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function BorrowForm() {
  const [memberId, setMemberId] = useState('')
  const [isbn, setIsbn] = useState('')
  const [days, setDays] = useState('14')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const result = await apiService.borrowItem(memberId, isbn, parseInt(days))
      setMessage(`Success: ${result}`)
      setMemberId('')
      setIsbn('')
      setDays('14')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Borrow Item</h3>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the details below to borrow an item.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
              Member ID
            </label>
            <input
              type="text"
              id="memberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter member ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter item ISBN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
              Borrowing Days
            </label>
            <select
              id="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="21">21 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Borrow Item'}
        </button>
      </form>

      {message && (
        <div className={`border rounded-md p-4 ${
          message.startsWith('Success') 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}

function ReturnForm() {
  const [memberId, setMemberId] = useState('')
  const [isbn, setIsbn] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const result = await apiService.returnItem(memberId, isbn)
      setMessage(`Success: ${result}`)
      setMemberId('')
      setIsbn('')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Return Item</h3>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the details below to return an item.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="returnMemberId" className="block text-sm font-medium text-gray-700 mb-2">
              Member ID
            </label>
            <input
              type="text"
              id="returnMemberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter member ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="returnIsbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN
            </label>
            <input
              type="text"
              id="returnIsbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter item ISBN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Return Item'}
        </button>
      </form>

      {message && (
        <div className={`border rounded-md p-4 ${
          message.startsWith('Success') 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}