import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Shield, Eye, Lock, Trash2, Clock, Globe } from 'lucide-react';

export default function Privacy() {
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Privacy Policy</h1>
                <p className="text-sm text-gray-600">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              At Anonymous Chat, your privacy is not just a feature—it's our foundation. We've built our 
              entire platform around the principle that you should be able to communicate freely without 
              compromising your personal information or digital footprint.
            </p>
          </div>

          {/* Data Collection */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">What We Don't Collect</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>No Personal Information:</strong> We don't ask for or store your real name, 
                  email address, phone number, or any other personally identifiable information.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>No Location Tracking:</strong> We don't track your physical location or 
                  IP address for identification purposes.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>No Browsing History:</strong> We don't monitor your browsing habits or 
                  track you across other websites.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>No Device Fingerprinting:</strong> We don't create unique identifiers 
                  based on your device characteristics.
                </p>
              </div>
            </div>
          </div>

          {/* What We Do Collect */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Minimal Data We Process</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Anonymous Username:</strong> Only the username you choose, which can be 
                  changed at any time and doesn't need to be your real name.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Chat Messages:</strong> Temporarily stored to enable real-time communication, 
                  automatically deleted after 24 hours.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Session Data:</strong> Basic technical information needed to maintain your 
                  chat session, cleared when you leave.
                </p>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Data Retention Policy</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Chat Messages</h3>
                <p className="text-sm text-orange-700">
                  Automatically deleted after 24 hours. No backups or archives are maintained.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">User Sessions</h3>
                <p className="text-sm text-blue-700">
                  Cleared immediately when you close the browser or log out.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Usernames</h3>
                <p className="text-sm text-green-700">
                  Released back to the pool after 24 hours of inactivity.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Reports</h3>
                <p className="text-sm text-purple-700">
                  Kept for 30 days for moderation purposes, then permanently deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Security Measures */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Security Measures</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Encryption</h3>
                <p className="text-gray-600">
                  All communications are encrypted in transit using industry-standard TLS encryption. 
                  Messages are not stored in encrypted form because they're automatically deleted.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Server Security</h3>
                <p className="text-gray-600">
                  Our servers are protected by multiple layers of security, including firewalls, 
                  intrusion detection systems, and regular security audits.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Access Controls</h3>
                <p className="text-gray-600">
                  Only essential personnel have access to our systems, and all access is logged 
                  and monitored for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Third Parties */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Third-Party Services</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              We use minimal third-party services to operate our platform:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Hosting Provider:</strong> For server infrastructure, with strict data 
                  processing agreements in place.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>CDN Services:</strong> For fast content delivery, with no user data sharing.
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mt-4">
              We do not use analytics services, advertising networks, or any other third parties 
              that would compromise your anonymity.
            </p>
          </div>

          {/* Your Rights */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-800">Your Rights</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Right to Deletion:</strong> You can clear all your data at any time by 
                  logging out or clearing your browser data.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Right to Anonymity:</strong> You never have to provide real personal 
                  information to use our service.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Right to Leave:</strong> You can stop using our service at any time 
                  without any consequences or data retention.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Questions About Privacy?</h2>
            <p className="mb-4 opacity-90">
              If you have any questions about our privacy practices, please don't hesitate to contact us.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'contact' })}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}