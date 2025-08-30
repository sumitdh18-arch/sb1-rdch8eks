import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Flag, Search, MoreVertical, Check, X, AlertTriangle } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface Report {
  id: string;
  reported_by: string;
  reported_user: string;
  reported_message: string | null;
  reason: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed' | 'escalated';
  action: string | null;
  action_by: string | null;
  action_timestamp: string | null;
  admin_notes: string | null;
  category: 'harassment' | 'spam' | 'inappropriate_content' | 'hate_speech' | 'other';
}

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, action?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          action,
          action_by: 'admin',
          action_timestamp: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'dismissed': return 'text-gray-400 bg-gray-500/20';
      case 'escalated': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'harassment': return '🚫';
      case 'spam': return '📧';
      case 'inappropriate_content': return '⚠️';
      case 'hate_speech': return '💬';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Report Management</h1>
          <p className="text-white/70">Review and manage user reports</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white font-medium">
              {reports.filter(r => r.status === 'pending').length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white font-medium">Report</th>
                <th className="text-left p-4 text-white font-medium">Category</th>
                <th className="text-left p-4 text-white font-medium">Status</th>
                <th className="text-left p-4 text-white font-medium">Created</th>
                <th className="text-left p-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{report.reason}</p>
                      <p className="text-white/50 text-sm">ID: {report.id.slice(0, 8)}...</p>
                      {report.admin_notes && (
                        <p className="text-blue-400 text-sm mt-1">Note: {report.admin_notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(report.category)}</span>
                      <span className="text-white/70 text-sm capitalize">
                        {report.category.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white/70 text-sm">
                      {formatRelativeTime(new Date(report.created_at))}
                    </span>
                  </td>
                  <td className="p-4">
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateReportStatus(report.id, 'resolved', 'Action taken')}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                          title="Resolve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'dismissed', 'No action needed')}
                          className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'escalated', 'Escalated to senior admin')}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Escalate"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <Flag className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No reports found</h3>
          <p className="text-white/50">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No reports have been submitted yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}