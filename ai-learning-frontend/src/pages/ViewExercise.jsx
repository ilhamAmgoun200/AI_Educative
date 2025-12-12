import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import UserMenu from '../components/UserMenu';
import { API_URL } from '../config/api';

const COLORS = ['#3b82f6', '#f59e42'];

const ViewExercise = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const { user, teacherId, isAuthenticated } = useAuth();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const demoStudents = 42;

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email || 'Utilisateur';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchExercise();
    fetchLessons();
  }, [exerciseId, isAuthenticated, teacherId]);

  const fetchExercise = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises/${exerciseId}`, {
        headers: getAuthHeaders(),
      });
      setExercise(response.data.data);
      setLoading(false);
    } catch (err) {
      alert('Erreur récupération exercice');
      navigate(-1);
    }
  };

  const fetchLessons = async () => {
    if (!teacherId) return;
    try {
      setLessonsLoading(true);
      const response = await axios.get(
        `${API_URL}/courses?teacher_id=${teacherId}&include_files=true`,
        { headers: getAuthHeaders() }
      );
      setLessons(response.data.data || []);
    } finally {
      setLessonsLoading(false);
    }
  };

  const totalCourses = lessons.length;
  const totalPublished = lessons.filter((l) => l.is_published).length;
  const totalDrafts = totalCourses - totalPublished;

  const lastLessons = lessons
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const pieData = [
    { name: 'Publié', value: totalPublished },
    { name: 'Brouillon', value: totalDrafts },
  ];

  if (loading || lessonsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-blue-300 border-t-blue-500 animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER IDENTIQUE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">
              E
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Enseignant</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <span className="text-gray-900 font-semibold">{userName}</span>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE – CARDS + CHART + LAST LESSONS */}
          <div className="lg:col-span-2 space-y-6">

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniKpiCard label="Total cours" value={totalCourses} icon="📚" accent="blue" />
              <MiniKpiCard label="Publiés" value={totalPublished} icon="✅" accent="green" />
              <MiniKpiCard label="Brouillons" value={totalDrafts} icon="✏️" accent="orange" />
              <MiniKpiCard label="Étudiants" value={demoStudents} icon="🧑‍🎓" accent="purple" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">

              {/* PIE CHART */}
              <div className="bg-white border border-gray-100 rounded-xl shadow p-5">
                <h3 className="text-base font-bold mb-3 text-blue-700 text-center">
                  Répartition des cours
                </h3>

                <div className="flex justify-center">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-2">
                  <LegendDot color={COLORS[0]} label="Publié" value={totalPublished} />
                  <LegendDot color={COLORS[1]} label="Brouillon" value={totalDrafts} />
                </div>
              </div>

              {/* LAST LESSONS */}
              <div className="bg-white border border-gray-100 rounded-xl shadow p-5">
                <h3 className="text-base font-bold mb-3 text-blue-700">Derniers cours créés</h3>
                <ul className="divide-y divide-gray-100">
                  {lastLessons.map((course) => (
                    <li key={course.id} className="py-2 text-xs">
                      <div className="font-semibold text-gray-900">{course.title}</div>

                      <div
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] border ${
                          course.is_published
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {course.is_published ? 'Publié' : 'Brouillon'}
                      </div>

                      <p className="text-[11px] text-gray-500">
                        {new Date(course.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – VIEW EXERCISE CARD */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

              <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                ← Retour
              </button>

              <h2 className="text-2xl font-extrabold mb-6 text-blue-700 flex items-center gap-2 justify-center">
                📄 Détails de l'exercice
              </h2>

              <h3 className="text-xl font-bold mb-2">{exercise.title}</h3>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{exercise.description}</p>

              {exercise.pdf_file && (
                <a
                  href={`${API_URL.replace('/api', '')}/uploads/exercises/${exercise.pdf_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mb-4 inline-block"
                >
                  📎 Voir le PDF
                </a>
              )}

              <button
                onClick={() => navigate(`/edit-exercise/${exercise.id}`)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg mt-4"
              >
                ✏ Modifier
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

function MiniKpiCard({ label, value, icon, accent }) {
  const accentColor = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  }[accent];

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-3 text-center flex flex-col items-center hover:scale-105 transition">
      <div className={`w-7 h-7 mb-1 rounded flex items-center justify-center ${accentColor}`}>
        {icon}
      </div>
      <div className="text-lg font-bold">{value}</div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }}></span>
      <span>
        {label} <strong>{value}</strong>
      </span>
    </div>
  );
}

export default ViewExercise;
