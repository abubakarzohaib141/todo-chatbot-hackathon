import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { todoAPI } from '../utils/api';

export default function Statistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const StatCard = ({ icon, label, value, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
      <div className={`p-4 rounded-2xl border border-white/60 shadow-sm bg-white/50 backdrop-blur-sm ${colorClasses[color]}`}>
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-xs text-gray-600 font-medium">{label}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
          <span className="text-lg font-bold text-blue-600">{stats.completion_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${stats.completion_percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon="📊" label="Total Tasks" value={stats.total} color="blue" />
        <StatCard icon="✅" label="Completed" value={stats.completed} color="green" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="orange" />
        <StatCard icon="🚩" label="High Priority" value={stats.high_priority} color="red" />
        <StatCard icon="⚠️" label="Overdue" value={stats.overdue} color="purple" />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-3">📅 Due This Week</div>
          <div className="text-3xl font-bold text-blue-600">{stats.due_this_week}</div>
          <p className="text-xs text-gray-600 mt-1">Tasks to complete soon</p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-3">📌 Due Today</div>
          <div className="text-3xl font-bold text-orange-600">{stats.due_today}</div>
          <p className="text-xs text-gray-600 mt-1">Tasks for today</p>
        </div>
      </div>
    </div>
  );
}
