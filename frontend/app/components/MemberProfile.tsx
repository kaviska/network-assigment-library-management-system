'use client'

import { useState } from 'react'
import { apiService } from '../services/apiService'

interface Member {
  memberId: string
  name: string
  email: string
  phone: string
  address: string
  registrationDate: string
  active: boolean
}

interface MemberProfileProps {
  memberData: Member
  onUpdate: (data: Member) => void
}

export default function MemberProfile({ memberData, onUpdate }: MemberProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(memberData)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    setEditData(memberData)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(memberData)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Note: The API doesn't have update member endpoint, so we'll simulate it
      // In a real implementation, you would call apiService.updateMember()
      onUpdate(editData)
      localStorage.setItem('currentMemberData', JSON.stringify(editData))
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Member, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getMembershipDuration = () => {
    try {
      const regDate = new Date(memberData.registrationDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - regDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 30) {
        return `${diffDays} days`
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} months`
      } else {
        const years = Math.floor(diffDays / 365)
        const months = Math.floor((diffDays % 365) / 30)
        return years > 0 ? `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}` : `${months} months`
      }
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
          <p className="text-gray-600">Manage your personal information and account details</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span>✏️</span>
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h3 className="text-2xl font-bold">{memberData.name}</h3>
            <p className="text-blue-100">Member ID: {memberData.memberId}</p>
            <p className="text-blue-100">Member since {getMembershipDuration()}</p>
          </div>
          <div className="ml-auto">
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${memberData.active 
                ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                : 'bg-red-500/20 text-red-100 border border-red-400/30'
              }
            `}>
              {memberData.active ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>👤</span>
            Personal Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{memberData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
              <p className="text-gray-900 font-medium bg-gray-100 px-3 py-2 rounded-md">{memberData.memberId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <p className="text-gray-900 font-medium">{formatDate(memberData.registrationDate)}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📞</span>
            Contact Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900 font-medium">{memberData.email || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 font-medium">{memberData.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={editData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-gray-900 font-medium">{memberData.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="mt-8 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            )}
            Save Changes
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Account Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Books Borrowed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$0.00</div>
            <div className="text-sm text-gray-600">Outstanding Fines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Total Borrowings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{getMembershipDuration()}</div>
            <div className="text-sm text-gray-600">Membership</div>
          </div>
        </div>
      </div>
    </div>
  )
}
