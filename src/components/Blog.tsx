import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, BookOpen, Calendar, User, Tag, Eye, Search, Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export default function Blog() {
  const { state, dispatch } = useApp();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'profile' });
  };

  const handleReadPost = (postId: string) => {
    setSelectedPost(postId);
    dispatch({ type: 'INCREMENT_BLOG_READ_COUNT', payload: postId });
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  const publishedPosts = state.blogPosts?.filter(post => post.published) || [];
  
  const filteredPosts = publishedPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(publishedPosts.flatMap(post => post.tags))];
  
  const currentPost = selectedPost ? publishedPosts.find(post => post.id === selectedPost) : null;

  if (currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-white/20">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Blog</h1>
                  <p className="text-sm text-gray-600">Reading: {currentPost.title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Post Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-white/20">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{currentPost.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatRelativeTime(currentPost.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{currentPost.readCount} reads</span>
                </div>
                {currentPost.updatedAt.getTime() !== currentPost.createdAt.getTime() && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatRelativeTime(currentPost.updatedAt)}</span>
                  </div>
                )}
              </div>

              {currentPost.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-2">
                    {currentPost.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {currentPost.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Anonymous Chat Blog - Latest Updates and Announcements</h1>
        <p>Read the latest updates, features, and announcements from Anonymous Chat platform. Stay informed about new features, security updates, and community guidelines.</p>
      </div>
      
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
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Blog</h1>
                <p className="text-sm text-gray-600">Latest updates and announcements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blog posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    !selectedTag 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedTag === tag 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 shadow-sm border border-white/20 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {publishedPosts.length === 0 ? 'No blog posts yet' : 'No posts found'}
              </h3>
              <p className="text-gray-500">
                {publishedPosts.length === 0 
                  ? 'Check back later for updates and announcements.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20 hover:bg-white/90 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleReadPost(post.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{post.readCount}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  {post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}