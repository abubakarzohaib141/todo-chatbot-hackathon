import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import ChatBox from '../components/ChatBox';
import { useChat } from '../hooks/useChat';

export default function ChatPage() {
  const router = useRouter();
  const { user, token, loading, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const chat = useChat(user?.id, token);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Load conversations from API
  const loadConversations = async () => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/${user.id}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id, token]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    chat.loadConversation(conv.id);
  };

  const handleNewConversation = () => {
    chat.clearMessages();
    setSelectedConversation(null);
  };

  const handleSendMessage = async (message) => {
    await chat.sendMessage(message);
    // Reload conversations to update the list
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewConversation}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <p className="truncate font-semibold">{conv.title || 'New Chat'}</p>
                <p className="text-xs text-gray-400 truncate">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => router.push('/todos')}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors mb-2"
          >
            My Tasks
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedConversation?.title || 'AI Todo Chat'}
              </h1>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-1 overflow-hidden">
          <ChatBox
            messages={chat.messages}
            loading={chat.loading}
            error={chat.error}
            onSendMessage={handleSendMessage}
            messagesEndRef={chat.messagesEndRef}
          />
        </div>
      </div>
    </div>
  );
}
