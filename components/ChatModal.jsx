import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatBox from './ChatBox';
import { useChat } from '../hooks/useChat';

export default function ChatModal({ isOpen, onClose }) {
  const { user, token, loading, isAuthenticated } = useAuth();
  const modalRef = useRef(null);

  // Initialize chat hook with auth data
  const chat = useChat(user?.id, token);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show loading message if auth is loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to use the AI chatbot assistant.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed bottom-0 right-0 md:bottom-6 md:right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col"
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          maxHeight: '600px',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">AI Task Assistant</h2>
            <p className="text-sm text-blue-100">Powered by Gemini 2.0 Flash</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 rounded-full p-2 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <ChatBox
            messages={chat.messages}
            loading={chat.loading}
            error={chat.error}
            onSendMessage={chat.sendMessage}
            messagesEndRef={chat.messagesEndRef}
          />
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
}
