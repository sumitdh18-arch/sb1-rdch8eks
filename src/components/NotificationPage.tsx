import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MessageCircle, Phone, Bell, CheckCircle, X, Shield, AlertTriangle } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export default function NotificationPage() {
  const { state, dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'profile' });
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const handleMarkAllAsRead = () => {
    state.notifications.forEach(notification => {
      if (!notification.read) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'call':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'admin_action':
        return <Shield className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'admin_action':
        return 'border-orange-200 bg-orange-50';
      case 'system':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;
  const adminNotifications = state.notifications.filter(n => n.type === 'admin_action');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Admin Notifications Section */}
        {adminNotifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Admin Messages ({adminNotifications.filter(n => !n.read).length} unread)
            </h2>
            
            <div className="space-y-3">
              {adminNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl p-4 border transition-all duration-300 ${
                    !notification.read 
                      ? 'border-orange-300 bg-orange-50 shadow-sm' 
                      : 'border-orange-200 bg-orange-25'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            !notification.read ? 'text-orange-900' : 'text-orange-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-orange-700 mt-1">{notification.message}</p>
                          {notification.actionType && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
                              Action: {notification.actionType}
                            </div>
                          )}
                          <p className="text-sm text-orange-600 mt-2">
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          )}
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Notifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">All Notifications</h2>
          
          {state.notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            state.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-md ${
                  !notification.read 
                    ? `ring-2 ring-blue-200 ${getNotificationStyle(notification.type)}` 
                    : getNotificationStyle(notification.type)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        {notification.from && (
                          <p className="text-sm text-gray-500 mt-2">From: {notification.from}</p>
                        )}
                        {notification.actionType && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Action: {notification.actionType}
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {state.notifications.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Bell className="w-4 h-4" />
              <span>
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All notifications read'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}