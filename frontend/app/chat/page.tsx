'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminChat from '../components/AdminChat';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mb-4 p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Chat</h1>
          <p className="text-sm text-gray-600">Chat with library members</p>
        </div>
        <AdminChat adminId={user.id.toString()} adminName={user.name} />
      </div>
    </div>
  );
}
