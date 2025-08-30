import React from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { MessageCircle, Users, Phone, Image } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  read_count: number;
  tags: string[];
}

export default function HomePage() {
  const { dispatch } = useApp();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, created_at, read_count, tags')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleStartChatting = () => {
    dispatch({ type: 'SET_PAGE', payload: 'username-setup' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* SEO Meta Tags for Blog Posts */}
      <div style={{ display: 'none' }}>
        <h1>Anonymous Chat - Free Online Chat Rooms with Latest Updates</h1>
        <p>Join anonymous chat rooms and read our latest blog posts about online chatting, privacy, and community updates. Free, secure, and private messaging platform.</p>
        {blogPosts.map((post) => (
          <div key={post.id}>
            <h2>{post.title} - Anonymous Chat Blog</h2>
            <p>{post.excerpt}</p>
            <span>Published {formatRelativeTime(new Date(post.created_at))}</span>
            <div>Tags: {post.tags.join(', ')}</div>
          </div>
        ))}
      </div>
      
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
          
          <div className="mb-12">
            <button
              onClick={handleStartChatting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Chatting
            </button>
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

        {/* Blog Posts Section */}
        {blogPosts.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Latest Updates</h2>
              <p className="text-gray-600">Stay informed about new features and announcements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatRelativeTime(new Date(post.created_at))}</span>
                    <span>{post.read_count} reads</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={handleStartChatting}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
              >
                Read More in Chat
              </button>
            </div>
          </div>
        )}

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
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20">
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${gradient} rounded-full mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}