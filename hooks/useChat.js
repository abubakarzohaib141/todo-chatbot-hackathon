import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useChat = (userId, token) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim() || !userId || !token) {
        setError('Missing user ID or authentication token');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        // Add user message to UI immediately
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Call chat endpoint
        const response = await axios.post(
          `${API_URL}/api/chat/${userId}`,
          {
            message: message,
            conversation_id: conversationId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const { conversation_id, response: assistantResponse, tool_calls, timestamp } = response.data;

        // Update conversation ID if new
        if (!conversationId) {
          setConversationId(conversation_id);
        }

        // Add assistant message to UI
        const assistantMessage = {
          id: timestamp,
          role: 'assistant',
          content: assistantResponse,
          tool_calls: tool_calls || [],
          created_at: timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);

      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || 'Failed to send message. Please try again.';
        setError(errorMessage);
        console.error('Chat error:', err);

        // Remove the user message if there was an error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [userId, token, conversationId]
  );

  const loadConversation = useCallback(
    async (convId) => {
      setError(null);
      setLoading(true);

      try {
        const response = await axios.get(
          `${API_URL}/api/chat/${userId}/conversations/${convId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { messages: loadedMessages } = response.data;
        setMessages(loadedMessages || []);
        setConversationId(convId);
        scrollToBottom();
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Failed to load conversation.';
        setError(errorMessage);
        console.error('Load conversation error:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId, token]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    loading,
    error,
    sendMessage,
    loadConversation,
    clearMessages,
    messagesEndRef,
  };
};
