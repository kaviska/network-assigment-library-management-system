// API service for communicating with the Java backend
const API_BASE_URL = 'http://localhost:8080/api'

export interface LibraryItem {
  isbn: string
  title: string
  author: string
  publicationYear: number
  available: boolean
  itemType: string
  itemDetails: string
}

export interface Member {
  memberId: string
  name: string
  email: string
  phone: string
  address: string
  registrationDate: string
  active: boolean
}

export interface LibraryStats {
  totalItems: number
  availableItems: number
  borrowedItems: number
  books: number
  referenceBooks: number
  magazines: number
  totalMembers: number
  activeMembers: number
}

class ApiService {
  private async fetchWithCors(url: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)
      return response
    } catch (error) {
      console.error('API request failed:', error)
      throw new Error('Failed to connect to the library system. Please make sure the backend server is running.')
    }
  }

  // Library Items API
  async getAllItems(): Promise<LibraryItem[]> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/items`)
    if (!response.ok) {
      throw new Error('Failed to fetch library items')
    }
    return response.json()
  }

  async getItemByIsbn(isbn: string): Promise<LibraryItem> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/items/${isbn}`)
    if (!response.ok) {
      throw new Error('Item not found')
    }
    return response.json()
  }

  async searchItems(keyword: string): Promise<LibraryItem[]> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/items/search?keyword=${encodeURIComponent(keyword)}`)
    if (!response.ok) {
      throw new Error('Failed to search items')
    }
    return response.json()
  }

  async removeItem(isbn: string): Promise<string> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/items/${isbn}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to remove item')
    }
    return response.text()
  }

  // Members API
  async getAllMembers(): Promise<Member[]> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/members`)
    if (!response.ok) {
      throw new Error('Failed to fetch members')
    }
    return response.json()
  }

  async getMemberById(memberId: string): Promise<Member> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/members/${memberId}`)
    if (!response.ok) {
      throw new Error('Member not found')
    }
    return response.json()
  }

  // Statistics API
  async getLibraryStats(): Promise<LibraryStats> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/stats`)
    if (!response.ok) {
      throw new Error('Failed to fetch statistics')
    }
    return response.json()
  }

  // Borrowing API
  async borrowItem(memberId: string, isbn: string, days: number): Promise<string> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/borrowings`, {
      method: 'POST',
      body: JSON.stringify({ memberId, isbn, days })
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to borrow item')
    }
    return response.text()
  }

  async returnItem(memberId: string, isbn: string): Promise<string> {
    const response = await this.fetchWithCors(`${API_BASE_URL}/borrowings`, {
      method: 'PUT',
      body: JSON.stringify({ memberId, isbn })
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to return item')
    }
    return response.text()
  }

  async getCurrentBorrowings(memberId: string): Promise<any[]> {
    // This is not implemented in the backend yet
    throw new Error('Borrowing history is not implemented in the web interface. Please use the console application.')
  }

  async getBorrowingHistory(memberId: string): Promise<any[]> {
    // This is not implemented in the backend yet
    throw new Error('Borrowing history is not implemented in the web interface. Please use the console application.')
  }

  // Utility methods
  isServerRunning(): boolean {
    // Simple check - in a real app, you might want to ping a health endpoint
    return true
  }

  getApiBaseUrl(): string {
    return API_BASE_URL
  }
}

// Export a singleton instance
export const apiService = new ApiService()
export default apiService