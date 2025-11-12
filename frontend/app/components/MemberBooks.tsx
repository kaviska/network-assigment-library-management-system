'use client'

import { useState, useEffect } from 'react'
import { apiService, LibraryItem } from '../services/apiService'

interface MemberBooksProps {
  memberId: string
}

export default function MemberBooks({ memberId }: MemberBooksProps) {
  const [books, setBooks] = useState<LibraryItem[]>([])
  const [filteredBooks, setFilteredBooks] = useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [selectedBook, setSelectedBook] = useState<LibraryItem | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterAndSortBooks()
  }, [books, searchQuery, filterType, sortBy])

  const fetchBooks = async () => {
    try {
      const data = await apiService.getAllItems()
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortBooks = () => {
    let filtered = books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'available' && book.available) ||
        (filterType === 'borrowed' && !book.available) ||
        (filterType === book.itemType.toLowerCase())

      return matchesSearch && matchesFilter
    })

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'year':
          return b.publicationYear - a.publicationYear
        case 'availability':
          return b.available ? 1 : -1
        default:
          return 0
      }
    })

    setFilteredBooks(filtered)
  }



  const getItemTypeIcon = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case 'book':
        return '📖'
      case 'referencebook':
        return '📚'
      case 'magazine':
        return '📰'
      default:
        return '📄'
    }
  }

  const getItemTypeColor = (itemType: string) => {
    switch (itemType.toLowerCase()) {
      case 'book':
        return 'bg-blue-100 text-blue-800'
      case 'referencebook':
        return 'bg-purple-100 text-purple-800'
      case 'magazine':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-600">Loading library collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Library Collection</h2>
        <p className="text-gray-600">Explore our extensive collection of books and resources</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Books</label>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full  text-black placeholder-gray-500 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="book">Books</option>
              <option value="referencebook">Reference Books</option>
              <option value="magazine">Magazines</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="year">Publication Year</option>
              <option value="availability">Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {filteredBooks.length} of {books.length} items
        </p>
        <div className="flex gap-2">
          {books.filter(b => b.available).length} available,
          {books.filter(b => !b.available).length} borrowed
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.isbn}
              className={`
                bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-lg
                ${book.available ? 'border-gray-200 hover:border-blue-300' : 'border-red-200 bg-red-50'}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{getItemTypeIcon(book.itemType)}</div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getItemTypeColor(book.itemType)}`}>
                    {book.itemType}
                  </span>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${book.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {book.available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-1">by {book.author}</p>
              <p className="text-gray-500 text-xs mb-3">Published: {book.publicationYear}</p>
              <p className="text-gray-500 text-xs mb-3">ISBN: {book.isbn}</p>

              {book.itemDetails && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.itemDetails}</p>
              )}

              <div className="mt-4">
                {book.available ? (
                  <div className="w-full bg-green-100 border border-green-300 text-green-800 py-2 px-4 rounded-md text-center font-medium">
                    ✅ Available for Borrowing
                  </div>
                ) : (
                  <div className="w-full bg-red-100 border border-red-300 text-red-800 py-2 px-4 rounded-md text-center font-medium">
                    ❌ Currently Borrowed
                  </div>
                )}
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{getItemTypeIcon(selectedBook.itemType)}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedBook.title}</h4>
                  <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">ISBN:</span>
                <span className="font-medium">{selectedBook.isbn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Publication Year:</span>
                <span className="font-medium">{selectedBook.publicationYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedBook.itemType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${selectedBook.available ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedBook.available ? 'Available' : 'Currently Borrowed'}
                </span>
              </div>
            </div>

            {selectedBook.itemDetails && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <span className="text-sm font-medium text-gray-700">Description: </span>
                <span className="text-sm text-gray-600">{selectedBook.itemDetails}</span>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                📍 To borrow this book, please visit the library front desk with your member ID.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBook(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
