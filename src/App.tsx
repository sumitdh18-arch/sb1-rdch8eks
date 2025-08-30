import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import AuthWrapper from './components/AuthWrapper';
import AuthenticatedHomePage from './components/AuthenticatedHomePage';
import AuthenticatedUsernameSetup from './components/AuthenticatedUsernameSetup';
import HomePage from './components/HomePage';
import UsernameSetup from './components/UsernameSetup';
import SupabaseChatRoomList from './components/SupabaseChatRoomList';
import SupabaseGeneralChatRoom from './components/SupabaseGeneralChatRoom';
import PrivateChat from './components/PrivateChat';
import PrivateChatList from './components/PrivateChatList';
import OnlineUsers from './components/OnlineUsers';
import AudioCall from './components/AudioCall';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Profile from './components/Profile';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Privacy from './components/Privacy';
import NotificationPage from './components/NotificationPage';
import Blog from './components/Blog';
import Footer from './components/Footer';

function AppContent() {
  const { state } = useApp();
  const { user } = useAuth();
  const { profile } = useProfile(user);

  const renderPage = () => {
    // If user is authenticated but no profile yet, show username setup
    if (user && !profile) {
      console.log('User authenticated but no profile, showing username setup')
      return <AuthenticatedUsernameSetup />;
    }

    console.log('Rendering page:', state.currentPage, 'User:', !!user, 'Profile:', !!profile)

    switch (state.currentPage) {
      case 'home':
        return user ? <AuthenticatedHomePage /> : <HomePage />;
      case 'admin-login':
        return <AdminLogin />;
      case 'username-setup':
        return user ? <AuthenticatedUsernameSetup /> : <UsernameSetup />;
      case 'authenticated-username-setup':
        return <AuthenticatedUsernameSetup />;
      case 'chat-rooms':
        return <SupabaseChatRoomList />;
      case 'chat-room':
        return <SupabaseGeneralChatRoom />;
      case 'private-chat':
        return <PrivateChat />;
      case 'private-chats':
        return <PrivateChatList />;
      case 'online-users':
        return <OnlineUsers />;
      case 'audio-call':
        return <AudioCall />;
      case 'admin-panel':
        return <AdminPanel />;
      case 'profile':
        return <Profile />;
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <ContactUs />;
      case 'privacy':
        return <Privacy />;
      case 'notifications':
        return <NotificationPage />;
      case 'blog':
        return <Blog />;
      default:
        console.log('Default case - User:', !!user, 'Profile:', !!profile)
        return user ? <AuthenticatedHomePage /> : <HomePage />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </AppProvider>
  );
}

export default App;