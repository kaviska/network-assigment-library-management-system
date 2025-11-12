'use client'

import { useState } from 'react'
import { apiService } from '../services/apiService'

export default function BorrowingManager() {
  const [activeSection, setActiveSection] = useState<'info' | 'borrow' | 'return'>('info')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Borrowing Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage item lending and returns</p>
        </div>
      </div>

      {/* Section Navigation with Modern Pills */}
      <div className="backdrop-blur-sm bg-white/90 shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveSection('info')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'info'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📋</span>
              <span>Information</span>
            </button>
            <button
              onClick={() => setActiveSection('borrow')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'borrow'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📤</span>
              <span>Borrow Item</span>
            </button>
            <button
              onClick={() => setActiveSection('return')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'return'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📥</span>
              <span>Return Item</span>
            </button>
          </nav>
        </div>

        <div className="p-8">
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
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>ℹ️</span>
          <span>Borrowing Information</span>
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="text-4xl mr-4">📚</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-900 mb-3">
                About Borrowing System
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>The OakTown Library borrowing system manages the lending of library items to registered members.</p>
                <ul className="list-none space-y-2 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📖</span>
                    <span>Books can be borrowed for up to 14 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📰</span>
                    <span>Magazines can be borrowed for up to 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📕</span>
                    <span>Reference books are restricted and cannot be borrowed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">💰</span>
                    <span>Daily costs apply: Books $0.50/day, Magazines $0.25/day, Reference Books $1.00/day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Members must be active to borrow items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <span>Items must be available (not currently borrowed)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-sm bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📤</span>
            <span>How to Borrow</span>
          </h4>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            <li className="pl-2">Ensure the member is registered and active</li>
            <li className="pl-2">Check that the item is available</li>
            <li className="pl-2">Use the console application to process the borrowing</li>
            <li className="pl-2">The system will calculate costs and update availability</li>
            <li className="pl-2">A borrowing record will be created with due date</li>
          </ol>
        </div>

        <div className="backdrop-blur-sm bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📥</span>
            <span>How to Return</span>
          </h4>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            <li className="pl-2">Locate the borrowed item in the system</li>
            <li className="pl-2">Use the console application to process the return</li>
            <li className="pl-2">The system will calculate total costs</li>
            <li className="pl-2">The item will be marked as available</li>
            <li className="pl-2">The borrowing record will be updated</li>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📤</span>
          <span>Borrow Item</span>
        </h3>
        <p className="text-sm text-gray-600">
          Fill in the details below to process a borrowing transaction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="memberId" className="block text-sm font-semibold text-gray-700 mb-3">
              👤 Member ID
            </label>
            <input
              type="text"
              id="memberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter member ID"
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-semibold text-gray-700 mb-3">
              📚 ISBN
            </label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter item ISBN"
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="days" className="block text-sm font-semibold text-gray-700 mb-3">
              📅 Borrowing Days
            </label>
            <select
              id="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            '📤 Borrow Item'
          )}
        </button>
      </form>

      {message && (
        <div className={`border-2 rounded-2xl p-6 shadow-lg animate-fadeIn ${
          message.startsWith('Success') 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
          <p className={`font-medium flex items-start gap-2 ${
            message.startsWith('Success') ? 'text-green-800' : 'text-red-800'
          }`}>
            <span className="text-2xl">{message.startsWith('Success') ? '✅' : '❌'}</span>
            <span>{message}</span>
          </p>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📥</span>
          <span>Return Item</span>
        </h3>
        <p className="text-sm text-gray-600">
          Fill in the details below to process a return transaction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="returnMemberId" className="block text-sm font-semibold text-gray-700 mb-3">
              👤 Member ID
            </label>
            <input
              type="text"
              id="returnMemberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter member ID"
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="returnIsbn" className="block text-sm font-semibold text-gray-700 mb-3">
              📚 ISBN
            </label>
            <input
              type="text"
              id="returnIsbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter item ISBN"
              className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            '📥 Return Item'
          )}
        </button>
      </form>

      {message && (
        <div className={`border-2 rounded-2xl p-6 shadow-lg animate-fadeIn ${
          message.startsWith('Success') 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
          <p className={`font-medium flex items-start gap-2 ${
            message.startsWith('Success') ? 'text-green-800' : 'text-red-800'
          }`}>
            <span className="text-2xl">{message.startsWith('Success') ? '✅' : '❌'}</span>
            <span>{message}</span>
          </p>
        </div>
      )}
    </div>
  )
}