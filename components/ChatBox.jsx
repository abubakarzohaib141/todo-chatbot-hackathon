import { useState } from 'react';
import { format } from 'date-fns';

export default function ChatBox({ messages, loading, error, onSendMessage, messagesEndRef }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const renderToolCalls = (toolCalls) => {
    if (!toolCalls || toolCalls.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-300">
        <p className="font-semibold text-blue-900 mb-1">Actions Performed:</p>
        {toolCalls.map((call, idx) => (
          <div key={idx} className="text-blue-800 ml-1 py-1">
            <div className="flex items-center gap-2">
              {call.result?.success ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">✗</span>
              )}
              <span className="font-medium">{call.tool}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center px-4">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm font-semibold mb-2">Start Chatting with AI</p>
              <p className="text-xs mb-3">Try saying things like:</p>
              <ul className="text-xs space-y-1 text-gray-500">
                <li>• "Add a task to buy groceries"</li>
                <li>• "Show my pending tasks"</li>
                <li>• "Mark task 1 as complete"</li>
                <li>• "What's due today?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm break-words ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && renderToolCalls(message.tool_calls)}
              <p
                className={`text-xs mt-1 opacity-70 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {format(new Date(message.created_at), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {error && (
          <div className="mx-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-white p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            autoFocus
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
