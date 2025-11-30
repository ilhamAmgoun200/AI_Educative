import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';
import { API_URL } from '../config/api';

const ProgressCard = () => {
  const [progressStats, setProgressStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressStats();
  }, []);

  const fetchProgressStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/progress/stats`, {
        headers: getAuthHeaders()
      });
      setProgressStats(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Erreur chargement progression:', err);
      setError('Impossible de charger votre progression');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = (percentage) => {
    if (percentage === 0) return 'text-gray-600';
    if (percentage < 30) return 'text-red-600';
    if (percentage < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-8">
        <p className="text-gray-600">Chargement de votre progression...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
        {error}
      </div>
    );
  }

  const totalProgress = progressStats.length > 0
    ? Math.round(progressStats.reduce((sum, stat) => sum + stat.percentage, 0) / progressStats.length)
    : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-4xl mr-3">📊</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ma Progression</h2>
            <p className="text-gray-600 text-sm">Suivez votre avancement dans chaque matière</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progression Globale</p>
          <p className={`text-3xl font-bold ${getProgressTextColor(totalProgress)}`}>
            {totalProgress}%
          </p>
        </div>
      </div>

      {progressStats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune progression enregistrée</p>
          <p className="text-sm text-gray-400 mt-2">Commencez à consulter des cours pour voir votre progression</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressStats.map((stat) => (
            <div
              key={stat.subject_id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {stat.subject_name}
                </h3>
                {stat.level && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {stat.level}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cours complétés</span>
                  <span className="font-semibold text-gray-800">
                    {stat.completed_courses} / {stat.total_courses}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Progression</span>
                    <span className={`text-sm font-bold ${getProgressTextColor(stat.percentage)}`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(stat.percentage)} transition-all duration-500 rounded-full`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Prof: {stat.teacher_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressCard;