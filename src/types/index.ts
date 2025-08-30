export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: Date;
  avatar: string;
  blockedUsers?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  timestamp: Date;
  chatId?: string;
  read?: boolean;
  delivered?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  users: User[];
  messages: Message[];
  createdAt: Date;
}

export interface PrivateChat {
  id: string;
  participants: [string, string];
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
  unreadCount?: number;
  blockedBy?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'call' | 'system' | 'admin_action';
  title: string;
  message: string;
  from?: string;
  timestamp: Date;
  read: boolean;
  actionType?: string;
  reportId?: string;
}

export interface AudioCall {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: 'ringing' | 'connected' | 'ended';
  startTime?: Date;
  endTime?: Date;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  role: 'super_admin' | 'moderator' | 'support';
  permissions: AdminPermission[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AdminPermission {
  action: 'manage_users' | 'manage_rooms' | 'manage_reports' | 'manage_admins' | 'broadcast' | 'view_analytics' | 'manage_blogs';
  granted: boolean;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedUser: string;
  reportedMessage?: string;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'resolved' | 'dismissed' | 'escalated';
  action?: string;
  actionBy?: string;
  actionTimestamp?: Date;
  adminNotes?: string;
  category: 'harassment' | 'spam' | 'inappropriate_content' | 'hate_speech' | 'other';
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  tags: string[];
  readCount: number;
}