import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import UserMenu from '../components/UserMenu';
import { API_URL } from '../config/api';

const COLORS = ['#3b82f6', '#f59e42']; // blue, orange

const DashboardTeacher = () => {
  const navigate = useNavigate();
  const { user, teacherId, isAuthenticated } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example stats
  const demoStudents = 42;
  const totalCourses = lessons.length;
  const totalPublished = lessons.filter(l => l.is_published).length;
  const totalDrafts = totalCourses - totalPublished;
  const lastLessons = lessons
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  useEffect(() => {
    if (!isAuthenticated()) navigate('/loginn');
    else fetchLessons();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchLessons = async () => {
    if (!teacherId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/courses?teacher_id=${teacherId}&include_files=true`,
        { headers: getAuthHeaders() }
      );
      setLessons(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Utilisateur';

  const pieData = [
    { name: 'Publié', value: totalPublished },
    { name: 'Brouillon', value: totalDrafts }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">E</div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Enseignant</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <span className="text-gray-900 font-semibold">{userName}</span>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* DASHBOARD */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <KpiCard label="Total cours" value={totalCourses} icon="📚" accent="blue" />
          <KpiCard label="Cours publiés" value={totalPublished} icon="✅" accent="green" />
          <KpiCard label="Brouillons" value={totalDrafts} icon="✏️" accent="orange" />
          <KpiCard label="Étudiants" value={demoStudents} icon="🧑‍🎓" accent="purple" />
        </div>

        {/* Dashboard reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Pie Chart Cours */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow p-6 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">
              Répartition des cours
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              <LegendDot color={COLORS[0]} label="Publié" value={totalPublished} />
              <LegendDot color={COLORS[1]} label="Brouillon" value={totalDrafts} />
            </div>
          </div>
          {/* Latest Lessons List */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Derniers cours créés
            </h3>
            {lastLessons.length === 0 ? (
              <p className="text-gray-400">Aucun cours créé récemment.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lastLessons.map((course) => (
                  <li key={course.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                    <div>
                      <span className="font-semibold text-gray-900 mr-2">{course.title}</span>
                      {course.is_published ? (
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs ml-1 border border-green-200">Publié</span>
                      ) : (
                        <span className="inline-block bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-xs ml-1 border border-orange-200">Brouillon</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(course.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <ActionCard
            icon="📖"
            title="Créer un cours"
            text="Publiez du contenu pédagogique"
            onClick={() => navigate('/create-lesson')}
            color="bg-blue-100 text-blue-700"
          />
          <ActionCard
            icon="📚"
            title="Mes cours"
            text="Voir et gérer vos cours"
            onClick={() => navigate('/my-lessons')}
            color="bg-purple-100 text-purple-700"
          />
          <ActionCard
            icon="🧑‍🎓"
            title="Mes étudiants"
            text="Liste / gestion étudiants (statique)"
            // onClick... (exemple)
            color="bg-orange-100 text-orange-600"
          />
        </div>
      </div>
    </div>
  );
};

function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-block w-4 h-4 rounded-full" style={{ background: color }} />
      <span>{label} <span className="font-semibold">{value}</span></span>
    </div>
  );
}

function KpiCard({ label, value, icon, accent }) {
  const accentColor = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500"
  }[accent];
  return (
    <div className="bg-white shadow border border-gray-100 rounded-xl p-6 text-center flex flex-col items-center">
      <div className={`w-12 h-12 flex items-center justify-center mb-2 rounded-lg text-2xl font-bold ${accentColor}`}>
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-gray-900">{value}</div>
      <div className="text-gray-600 mt-1 text-base font-medium">{label}</div>
    </div>
  );
}

function ActionCard({ icon, title, text, onClick, color }) {
  return (
    <div
      className={`group bg-white p-6 rounded-2xl shadow border border-gray-100 cursor-pointer transition hover:shadow-lg`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

export default DashboardTeacher;