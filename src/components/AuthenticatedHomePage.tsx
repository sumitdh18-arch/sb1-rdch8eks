import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { MessageCircle, Users, Phone, Image, LogIn, UserPlus } from 'lucide-react'

export default function AuthenticatedHomePage() {
  const { signInAnonymously } = useAuth()

  const handleStartChatting = async () => {
    // This will trigger the username setup flow
    const username = `Guest${Date.now().toString().slice(-4)}`
    await signInAnonymously(username)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Anonymous Chat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with strangers, share thoughts anonymously
          </p>
          
          <div className="mb-12 space-y-4">
            <button
              onClick={handleStartChatting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <UserPlus className="w-5 h-5" />
              Start Anonymous Chat
            </button>
            
            <p className="text-sm text-gray-500">
              No registration required • Completely anonymous • Secure
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Chat Rooms"
            description="Join public rooms and meet new people"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Private Messages"
            description="Have one-on-one conversations"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Phone className="w-8 h-8" />}
            title="Audio Calls"
            description="Talk directly with voice calls"
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<Image className="w-8 h-8" />}
            title="Photo Sharing"
            description="Share images in your conversations"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Footer Links */}
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <a href="/admin.html" target="_blank" className="hover:text-blue-600 transition-colors">
              Admin Panel
            </a>
            <span>•</span>
            <span>Anonymous Chat Platform</span>
            <span>•</span>
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20">
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${gradient} rounded-full mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}