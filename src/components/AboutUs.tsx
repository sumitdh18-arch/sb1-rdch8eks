import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MessageCircle, Users, Shield, Heart, Zap, Globe } from 'lucide-react';

export default function AboutUs() {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'profile' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-white/20">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 transition-colors p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">About Us</h1>
                <p className="text-sm text-gray-600">Learn about Anonymous Chat</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mission Statement */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Anonymous Chat is dedicated to creating a safe, inclusive, and engaging platform where people 
              from around the world can connect, share ideas, and build meaningful relationships without 
              the barriers of identity or judgment.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">What We Offer</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Public Chat Rooms</h3>
                <p className="text-gray-600 text-sm">
                  Join themed chat rooms and connect with people who share your interests.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Private Messaging</h3>
                <p className="text-gray-600 text-sm">
                  Have one-on-one conversations with complete privacy and security.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Anonymous & Safe</h3>
                <p className="text-gray-600 text-sm">
                  Your identity remains completely anonymous with robust moderation systems.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Values</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Inclusivity</h3>
                  <p className="text-gray-600">
                    We welcome people from all backgrounds, cultures, and walks of life. Everyone deserves 
                    a space to express themselves freely and safely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Privacy First</h3>
                  <p className="text-gray-600">
                    Your privacy is our top priority. We don't collect personal information, and all 
                    conversations are designed to be temporary and secure.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Innovation</h3>
                  <p className="text-gray-600">
                    We continuously improve our platform with new features and technologies to enhance 
                    your chatting experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Global Community</h3>
                  <p className="text-gray-600">
                    We're building a worldwide community where geographical boundaries don't limit 
                    human connections and friendships.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Team</h2>
            <p className="text-gray-600 leading-relaxed">
              Anonymous Chat is built by a passionate team of developers, designers, and community moderators 
              who believe in the power of anonymous communication. We work around the clock to ensure our 
              platform remains safe, reliable, and enjoyable for everyone.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Our diverse team brings together expertise in cybersecurity, user experience design, 
              community management, and cutting-edge web technologies to create the best possible 
              anonymous chatting experience.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
            <p className="mb-4 opacity-90">
              Ready to start connecting with people from around the world?
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' })}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-full transition-colors"
            >
              Start Chatting Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}