'use client'

import { useState, useEffect } from 'react'
import { apiService, LibraryItem, AddItemRequest } from '../services/apiService'

export default function ItemsManager() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingItem, setAddingItem] = useState(false)

  const [newItem, setNewItem] = useState<AddItemRequest>({
    isbn: '',
    title: '',
    author: '',
    publicationYear: new Date().getFullYear(),
    itemType: 'book',
    pages: 0,
    genre: '',
    issueNumber: 0,
    volume: 1,
    frequency: 'Monthly',
    restricted: false
  })

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingItem(true)
    setError(null)

    try {
      // Validate required fields
      if (!newItem.isbn.trim() || !newItem.title.trim() || !newItem.author.trim()) {
        throw new Error('ISBN, Title, and Author are required')
      }

      // Create the item request based on type
      const itemRequest: AddItemRequest = {
        isbn: newItem.isbn.trim(),
        title: newItem.title.trim(),
        author: newItem.author.trim(),
        publicationYear: newItem.publicationYear,
        itemType: newItem.itemType
      }

      // Add type-specific fields
      if (newItem.itemType === 'book') {
        if (!newItem.pages || newItem.pages <= 0) {
          throw new Error('Pages must be a positive number for books')
        }
        itemRequest.pages = newItem.pages
        itemRequest.genre = newItem.genre?.trim() || 'General'
      } else if (newItem.itemType === 'magazine') {
        if (!newItem.issueNumber || newItem.issueNumber <= 0) {
          throw new Error('Issue number must be a positive number for magazines')
        }
        itemRequest.issueNumber = newItem.issueNumber
        itemRequest.volume = newItem.volume || 1
        itemRequest.frequency = newItem.frequency || 'Monthly'
      } else if (newItem.itemType === 'reference book') {
        if (!newItem.pages || newItem.pages <= 0) {
          throw new Error('Pages must be a positive number for reference books')
        }
        itemRequest.pages = newItem.pages
        itemRequest.genre = newItem.genre?.trim() || 'Reference'
        itemRequest.restricted = newItem.restricted || false
      }

      await apiService.addItem(itemRequest)
      alert('Item added successfully!')
      
      // Reset form
      setNewItem({
        isbn: '',
        title: '',
        author: '',
        publicationYear: new Date().getFullYear(),
        itemType: 'book',
        pages: 0,
        genre: '',
        issueNumber: 0,
        volume: 1,
        frequency: 'Monthly',
        restricted: false
      })
      setShowAddForm(false)
      fetchItems() // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to add item: ${errorMessage}`)
    } finally {
      setAddingItem(false)
    }
  }

  const resetForm = () => {
    setNewItem({
      isbn: '',
      title: '',
      author: '',
      publicationYear: new Date().getFullYear(),
      itemType: 'book',
      pages: 0,
      genre: '',
      issueNumber: 0,
      volume: 1,
      frequency: 'Monthly',
      restricted: false
    })
    setShowAddForm(false)
    setError(null)
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
            Library Items
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your library collection</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <span>➕</span>
            <span>{showAddForm ? 'Cancel' : 'Add Item'}</span>
          </button>
          <button
            onClick={fetchItems}
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
                  onClick={fetchItems}
                  className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                >
                  🔄 Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <span>➕</span>
            Add New Library Item
          </h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ISBN *</label>
                <input
                  type="text"
                  value={newItem.isbn}
                  onChange={(e) => setNewItem({ ...newItem, isbn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter ISBN"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                <input
                  type="text"
                  value={newItem.author}
                  onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter author"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publication Year *</label>
                <input
                  type="number"
                  value={newItem.publicationYear}
                  onChange={(e) => setNewItem({ ...newItem, publicationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1000"
                  max="2100"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Type *</label>
                <select
                  value={newItem.itemType}
                  onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value as 'book' | 'magazine' | 'reference book' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="book">Book</option>
                  <option value="magazine">Magazine</option>
                  <option value="reference book">Reference Book</option>
                </select>
              </div>
            </div>

            {/* Type-specific fields */}
            {(newItem.itemType === 'book' || newItem.itemType === 'reference book') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pages *</label>
                  <input
                    type="number"
                    value={newItem.pages || ''}
                    onChange={(e) => setNewItem({ ...newItem, pages: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre {newItem.itemType === 'reference book' ? '(optional)' : '(optional)'}
                  </label>
                  <input
                    type="text"
                    value={newItem.genre || ''}
                    onChange={(e) => setNewItem({ ...newItem, genre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={newItem.itemType === 'reference book' ? 'Reference' : 'General'}
                  />
                </div>
                {newItem.itemType === 'reference book' && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newItem.restricted || false}
                        onChange={(e) => setNewItem({ ...newItem, restricted: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Restricted Access</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {newItem.itemType === 'magazine' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Number *</label>
                  <input
                    type="number"
                    value={newItem.issueNumber || ''}
                    onChange={(e) => setNewItem({ ...newItem, issueNumber: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                  <input
                    type="number"
                    value={newItem.volume || 1}
                    onChange={(e) => setNewItem({ ...newItem, volume: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newItem.frequency || 'Monthly'}
                    onChange={(e) => setNewItem({ ...newItem, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingItem}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {addingItem ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="backdrop-blur-sm bg-white/90 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
          🔍 Search Items
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 placeholder-gray-400"
        />
      </div>

      {/* Items List */}
      <div className="backdrop-blur-sm bg-white/90 shadow-xl overflow-hidden rounded-2xl border border-gray-200/50">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📚</span>
            <span>All Library Items ({filteredItems.length})</span>
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Browse and manage all library items
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No items match your search criteria.' : 'No items found.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <li key={item.isbn} className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="shrink-0 transform hover:scale-110 transition-transform">
                      <div className="text-4xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                        {getItemIcon(item.itemType)}
                      </div>
                    </div>
                    <div className="ml-5 min-w-0 flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {item.title}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.available 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md' 
                            : 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md'
                        }`}>
                          {item.available ? '✅ Available' : '📤 Borrowed'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">
                          👤 {item.author} • 📅 {item.publicationYear} • 🔖 {item.isbn}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.itemType} • {item.itemDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleRemoveItem(item.isbn)}
                      className="group relative p-3 text-red-500 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                      title="Remove item"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Success Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="text-4xl mr-4">✅</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Library Item Management Ready
            </h3>
            <div className="text-sm text-blue-700">
              <p>The library management system is now fully connected to the backend! You can:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Add new books, magazines, and reference books using the form above</li>
                <li>View all library items with real-time availability status</li>
                <li>Remove items when needed</li>
                <li>Search through the collection by title, author, or ISBN</li>
              </ul>
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