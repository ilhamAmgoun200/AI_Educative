import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import UserMenu from '../components/UserMenu';
import { API_URL } from '../config/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#f59e42'];

const AddExercise = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { user, teacherId, isAuthenticated } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('');
  const [msg, setMsg] = useState({ type: '', content: '' });

  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'Utilisateur';
  const demoStudents = 42;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
    } else {
      fetchLessons();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, teacherId]);

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
  const totalPublished = lessons.filter(l => l.is_published).length;
  const totalDrafts = totalCourses - totalPublished;
  const lastLessons = lessons
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const pieData = [
    { name: 'Publié', value: totalPublished },
    { name: 'Brouillon', value: totalDrafts }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setMsg({ type: 'error', content: 'Le champ titre est obligatoire.' });
      setFocus('title');
      return;
    }

    setLoading(true);
    setMsg({ type: '', content: '' });

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course_id', lessonId);
      if (pdfFile) formData.append('file', pdfFile);

      await axios.post(`${API_URL}/exercises`, formData, {
        headers: getAuthHeaders(),
      });

      setMsg({ type: 'success', content: "L'exercice a été ajouté avec succès ! 🎉" });
      setTimeout(() => {
        navigate(`/view-lesson/${lessonId}`);
      }, 950);
    } catch (err) {
      setMsg({ type: 'error', content: "Erreur lors de l’ajout de l’exercice. Vérifiez le PDF ou la connexion." });
    } finally {
      setLoading(false);
    }
  };

  if (lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER identique Dashboard */}
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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Dashboard widgets col */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              <MiniKpiCard label="Total cours" value={totalCourses} icon="📚" accent="blue" />
              <MiniKpiCard label="Publiés" value={totalPublished} icon="✅" accent="green" />
              <MiniKpiCard label="Brouillons" value={totalDrafts} icon="✏️" accent="orange" />
              <MiniKpiCard label="Étudiants" value={demoStudents} icon="🧑‍🎓" accent="purple" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow p-4 flex flex-col items-center transition-shadow hover:shadow-xl min-h-[18rem]">
              <h3 className="text-base md:text-lg font-bold mb-3 text-blue-700 text-center">
                Répartition des cours
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                <LegendDot color={COLORS[0]} label="Publié" value={totalPublished} />
                <LegendDot color={COLORS[1]} label="Brouillon" value={totalDrafts} />
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow px-0 pb-0 pt-1 overflow-hidden min-h-[18rem]">
              <div className="flex items-center gap-2 mx-5 mt-2 mb-3">
                <span className="w-1 h-5 rounded-full bg-blue-500"></span>
                <h3 className="text-base md:text-lg font-extrabold text-blue-800 tracking-tight">
                  Derniers cours créés
                </h3>
              </div>
              {lastLessons.length === 0 ? (
                <div className="flex flex-col items-center py-5">
                  <span className="text-2xl mb-2">📄</span>
                  <span className="text-gray-400 text-xs">Aucun cours créé récemment.</span>
                </div>
              ) : (
                <ul>
                  {lastLessons.map((course) => (
                    <li
                      key={course.id}
                      className={`
                        relative group flex items-center justify-between pr-4 pl-3 py-2 cursor-pointer
                        transition hover:bg-blue-50 focus-within:bg-blue-50 border-l-4
                        ${course.is_published ? "border-green-400" : "border-orange-400"}
                        text-sm
                      `}
                      tabIndex={0}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 flex-1 justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className={`
                            inline-flex items-center px-1 py-0.5 rounded text-xs font-bold
                            ${course.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                            }
                          `}>
                            {course.is_published ? (
                              <span className="mr-1">✔️</span>
                            ) : (
                              <span className="mr-1">⏳</span>
                            )}
                            {course.is_published ? "Publié" : "Brouillon"}
                          </span>
                          <span className="ml-1 font-semibold text-gray-900 truncate max-w-[80px] sm:max-w-[100px]" title={course.title}>
                            {course.title}
                          </span>
                        </div>
                        <span className="ml-2 text-xs font-mono text-gray-500">
                          {new Date(course.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Right : Add Exercise form */}
          <div className="lg:col-span-8 order-1 lg:order-2 flex items-center justify-center">
            <div className="bg-white p-7 sm:p-12 rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-100 transition-shadow hover:shadow-2xl">
              {/* === BOUTON RETOUR ICI === */}
              <button
                type="button"
                onClick={() => navigate(`/view-lesson/${lessonId}`)}
                className="mb-5 inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-lg font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <span className="text-xl">←</span> Retour au cours
              </button>
              <h2 className="text-3xl font-extrabold mb-6 text-gray-900 flex items-center gap-2 justify-center">
                <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-2 text-xl">➕</span>
                Ajouter un exercice
              </h2>
              {msg.content && (
                <div className={{
                  'success':'mb-4 text-green-700 bg-green-50 border border-green-200 rounded-md py-2 px-4 flex items-center gap-2',
                  'error':'mb-4 text-red-700 bg-red-50 border border-red-200 rounded-md py-2 px-4 flex items-center gap-2'
                }[msg.type]}>
                  {msg.type === 'success' ? <span>✅</span> : <span>❌</span>}
                  <span>{msg.content}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5 text-lg">
                <div>
                  <label className="block mb-1 font-medium text-gray-800 text-base">
                    <span className="mr-2 text-blue-500">📝</span>
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onBlur={() => setFocus('')}
                      onFocus={() => setFocus('title')}
                      onChange={(e) => setTitle(e.target.value)}
                      className={
                        `w-full border px-4 py-3 rounded-xl focus:outline-none text-lg transition
                        ${focus==='title' ? 'border-blue-400 ring-1 ring-blue-200 shadow' : 'border-gray-300'}
                        ${msg.type==='error' && !title ? 'border-red-400 ring-1 ring-red-100' : ''}`
                      }
                      placeholder="Titre de l'exercice"
                      required
                      autoFocus
                    />
                    {focus==='title' ? (
                      <span className="absolute right-3 top-4 text-blue-400">
                        <svg width="20" height="20"><circle cx="10" cy="10" r="6" fill="#3b82f6" opacity=".1" /></svg>
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-800 text-base">
                    <span className="mr-2 text-purple-500">💬</span>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onBlur={() => setFocus('')}
                    onFocus={() => setFocus('description')}
                    onChange={(e) => setDescription(e.target.value)}
                    className={
                      `w-full border px-4 py-3 rounded-xl focus:outline-none text-lg transition
                      ${focus==='description' ? 'border-purple-400 ring-1 ring-purple-200 shadow': 'border-gray-300'}`
                    }
                    rows={4}
                    placeholder="Description détaillée ou consignes…"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-800 text-base">
                    <span className="mr-2 text-orange-500">📎</span>
                    PDF (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="text-base"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  {pdfFile && (
                    <span className="text-green-700 ml-2 text-xs">Sélectionné: {pdfFile.name}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" strokeWidth="3" stroke="#bfdbfe" fill="none"/><path d="M8 1a7 7 0 017 7" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" /></svg>
                        Ajout...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">➕</span> Ajouter
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/view-lesson/${lessonId}`)}
                    className="flex-1 bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition font-semibold text-lg"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mini KPI cards ---
function MiniKpiCard({ label, value, icon, accent }) {
  const accentColor = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500"
  }[accent];
  return (
    <div className="bg-white shadow border border-gray-100 rounded-xl p-3 text-center flex flex-col items-center min-w-[90px] transition-transform hover:scale-[1.03]">
      <div className={`w-8 h-8 flex items-center justify-center mb-1 rounded-lg text-lg font-bold ${accentColor} shadow`}>
        {icon}
      </div>
      <div className="text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-gray-600 mt-0.5 text-xs font-semibold">{label}</div>
    </div>
  );
}
function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
      <span>{label} <span className="font-semibold">{value}</span></span>
    </div>
  );
}

export default AddExercise;