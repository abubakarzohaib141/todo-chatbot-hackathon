import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { todoAPI } from '../utils/api';
import Statistics from './Statistics';

const PREDEFINED_TAGS = [
  { name: 'Work', icon: '💼', color: 'blue' },
  { name: 'Personal', icon: '👤', color: 'purple' },
  { name: 'Shopping', icon: '🛒', color: 'green' },
  { name: 'Health', icon: '💪', color: 'red' },
  { name: 'Study', icon: '📚', color: 'indigo' },
  { name: 'Home', icon: '🏠', color: 'orange' },
];

export default function TodoList() {
  const { token } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshStats, setRefreshStats] = useState(0);

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token, searchTerm, filterPriority, filterCompleted, sortBy, sortOrder, refreshStats]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        priority: filterPriority,
        sortBy,
        sortOrder,
      };

      if (filterCompleted !== '') {
        filters.completed = filterCompleted === 'completed';
      }

      const response = await todoAPI.getAll(filters);
      setTodos(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const allTags = [...selectedTags];
      if (customTag.trim()) {
        allTags.push(customTag.trim());
      }

      const response = await todoAPI.create(
        newTodo,
        description,
        priority,
        allTags,
        null
      );
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setDescription('');
      setPriority('medium');
      setSelectedTags([]);
      setCustomTag('');
      setShowTagInput(false);
      setError('');
      setRefreshStats(prev => prev + 1);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleMarkDone = async (id, completed) => {
    try {
      const response = completed
        ? await todoAPI.markUndone(id)
        : await todoAPI.markDone(id);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
      setRefreshStats(prev => prev + 1);
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id) => {
    try {
      await todoAPI.delete(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      setRefreshStats(prev => prev + 1);
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const HelpIcon = ({ text }) => (
    <div className="relative group inline-block ml-1">
      <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 -top-8 left-0 w-40 z-50 whitespace-normal">
        {text}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <Statistics key={refreshStats} />

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="✨ What needs to be done?"
              className="flex-1 rounded-xl border-none bg-blue-50/50 px-5 py-3 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-blue-300/70 font-medium"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 transition-all font-semibold whitespace-nowrap active:scale-95"
            >
              ➕ Add
            </button>
          </div>

          {/* Task Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Description <HelpIcon text="Add more details about your task" />
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details..."
                rows="2"
                className="w-full rounded-xl border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-blue-300/70 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Priority <HelpIcon text="High priority tasks show first" />
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Category <HelpIcon text="Organize tasks by type" />
              </label>
              <div className="flex flex-wrap gap-2 bg-blue-50/50 p-2 rounded-xl">
                {PREDEFINED_TAGS.map(tag => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag.name)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tag.icon} {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <span key={tag} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {tag} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Filters & Search */}
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">🔍 Search & Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="rounded-lg border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-blue-300/70 text-sm"
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          >
            <option value="">🎯 All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value)}
            className="rounded-lg border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          >
            <option value="">📋 All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Done</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          >
            <option value="created_at">📅 Date Created</option>
            <option value="priority">🚩 Priority</option>
            <option value="title">🔤 Title A-Z</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-lg border-none bg-blue-50/50 px-4 py-2 text-gray-900 shadow-inner focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          >
            <option value="desc">⬇️ Newest First</option>
            <option value="asc">⬆️ Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-center gap-3 text-red-700 shadow-sm">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Todo List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your tasks...</p>
          <p className="text-sm text-gray-500 mt-1">This should only take a moment</p>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-16 bg-white/30 rounded-3xl border-2 border-dashed border-blue-200">
          <div className="max-w-md mx-auto space-y-6">
            <p className="text-7xl animate-bounce">👋</p>
            <h3 className="text-2xl font-bold text-gray-800">Welcome to Your Tasks!</h3>
            <p className="text-gray-600">
              Get started by creating your first task above. You can organize with priorities, categories, and more!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-sm text-gray-800">Set Priorities</div>
                <p className="text-xs text-gray-600 mt-1">High, medium, or low</p>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                <div className="text-2xl mb-2">🏷️</div>
                <div className="font-semibold text-sm text-gray-800">Add Categories</div>
                <p className="text-xs text-gray-600 mt-1">Work, personal, shopping, etc.</p>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-sm text-gray-800">Track Progress</div>
                <p className="text-xs text-gray-600 mt-1">See your completion rate above</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 font-medium px-1">
            📌 Showing {todos.length} task{todos.length !== 1 ? 's' : ''}
          </p>
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                todo.completed
                  ? 'bg-gray-50/80 border-gray-100'
                  : 'bg-white border-white/60 shadow-sm hover:shadow-md hover:border-blue-100'
              }`}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleMarkDone(todo.id, todo.completed)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all checked:border-blue-600"
                />
              </div>

              <div className="flex-grow min-w-0">
                <p
                  className={`font-medium text-lg transition-colors ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {todo.title}
                </p>
                {todo.description && (
                  <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-300' : 'text-gray-500'}`}>
                    {todo.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority.toUpperCase()}
                  </span>

                  {todo.tags && todo.tags.length > 0 && (
                    <>
                      {todo.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200"
                        >
                          🏷️ {tag}
                        </span>
                      ))}
                    </>
                  )}

                  {todo.due_date && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                      📅 {new Date(todo.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all focus:opacity-100"
                title="Delete task"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
