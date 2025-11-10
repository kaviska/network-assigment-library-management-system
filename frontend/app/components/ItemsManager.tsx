'use client'

import { useState, useEffect } from 'react'
import { apiService, LibraryItem } from '../services/apiService'

export default function ItemsManager() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    // Filter items based on search term
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [items, searchTerm])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getAllItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (isbn: string) => {
    if (!confirm('Are you sure you want to remove this item?')) {
      return
    }

    try {
      await apiService.removeItem(isbn)
      alert('Item removed successfully!')
      fetchItems() // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      alert(`Failed to remove item: ${errorMessage}`)
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
        <h2 className="text-2xl font-bold text-gray-900">Library Items</h2>
        <button
          onClick={fetchItems}
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
                  onClick={fetchItems}
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
              Search Items
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            All Library Items ({filteredItems.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Browse and manage all library items
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            {searchTerm ? 'No items match your search criteria.' : 'No items found.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <li key={item.isbn} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="shrink-0">
                      <span className="text-2xl">
                        {getItemIcon(item.itemType)}
                      </span>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'Available' : 'Borrowed'}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          by {item.author} • {item.publicationYear} • ISBN: {item.isbn}
                        </p>
                        <p className="text-sm text-gray-400">
                          {item.itemType} • {item.itemDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRemoveItem(item.isbn)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Item Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Adding New Items
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>To add new items to the library, please use the console application or contact your system administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getItemIcon(itemType: string): string {
  switch (itemType.toLowerCase()) {
    case 'book':
      return '📖'
    case 'reference book':
      return '📕'
    case 'magazine':
      return '📰'
    default:
      return '📚'
  }
}