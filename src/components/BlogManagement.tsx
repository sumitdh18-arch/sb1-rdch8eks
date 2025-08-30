import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  tags: string[];
  read_count: number;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    published: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt || newPost.content.substring(0, 150) + '...',
          author: 'Admin',
          author_id: 'admin',
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          published: newPost.published
        });

      if (error) throw error;
      
      setNewPost({ title: '', content: '', excerpt: '', tags: '', published: false });
      setShowCreateModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const updatePost = async () => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: editingPost.title,
          content: editingPost.content,
          excerpt: editingPost.excerpt,
          tags: editingPost.tags,
          published: editingPost.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id);

      if (error) throw error;
      
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const togglePublished = async (postId: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !published })
        .eq('id', postId);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading blog posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-white/70">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                  <div className="flex items-center gap-2">
                    {post.published ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">
                        Draft
                      </span>
                    )}
                    <span className="text-white/50 text-xs">
                      {post.read_count} reads
                    </span>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>By {post.author}</span>
                  <span>Created {formatRelativeTime(new Date(post.created_at))}</span>
                  {post.updated_at !== post.created_at && (
                    <span>Updated {formatRelativeTime(new Date(post.updated_at))}</span>
                  )}
                </div>
                
                {post.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => togglePublished(post.id, post.published)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.published 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                  }`}
                  title={post.published ? 'Unpublish' : 'Publish'}
                >
                  {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No posts found</h3>
          <p className="text-white/50">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No blog posts have been created yet.'}
          </p>
        </div>
      )}

      {/* Create/Edit Post Modal */}
      {(showCreateModal || editingPost) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingPost ? editingPost.title : newPost.title}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, title: e.target.value })
                    : setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={editingPost ? editingPost.excerpt : newPost.excerpt}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, excerpt: e.target.value })
                    : setNewPost({ ...newPost, excerpt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (optional)"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editingPost ? editingPost.content : newPost.content}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, content: e.target.value })
                    : setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your post content..."
                  rows={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingPost ? editingPost.tags.join(', ') : newPost.tags}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(tag => tag.trim()) })
                    : setNewPost({ ...newPost, tags: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="announcement, update, feature"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost ? editingPost.published : newPost.published}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, published: e.target.checked })
                    : setNewPost({ ...newPost, published: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPost(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPost ? updatePost : createPost}
                disabled={editingPost 
                  ? !editingPost.title.trim() || !editingPost.content.trim()
                  : !newPost.title.trim() || !newPost.content.trim()
                }
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}