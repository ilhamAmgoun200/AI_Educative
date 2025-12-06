import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/auth';
import UserMenu from '../components/UserMenu';
import { API_URL } from '../config/api';

const BADGE_STYLES = {
  published: 'bg-green-50 text-green-700 border border-green-200',
  draft: 'bg-orange-50 text-orange-700 border-orange-200',
};
const COLORS = ['#3b82f6', '#f59e42'];

const ViewLesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { user, teacherId, isAuthenticated } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // ------ AJOUT POUR IA GENERATION -------
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenError, setAiGenError] = useState('');
  const [aiExercisePDF, setAiExercisePDF] = useState(null);
  // ---------------------------------------

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email || 'Utilisateur';
  const demoStudents = 42;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/loginn');
      return;
    }
    fetchLesson();
    fetchExercises();
    fetchLessons();
    // eslint-disable-next-line
  }, [lessonId, isAuthenticated, teacherId, navigate]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/courses/${lessonId}?include_files=true`, {
        headers: getAuthHeaders(),
      });
      if (response.data?.data) setLesson(response.data.data);
    } catch (err) {
      if (err.response?.status === 404) setError(`Cours introuvable (ID: ${lessonId})`);
      else if (err.response?.status === 403) setError('Vous n\'avez pas la permission d\'accéder à ce cours.');
      else if (err.response?.status === 401) setError('Session expirée. Veuillez vous reconnecter.');
      else setError('Impossible de charger le cours');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises/course/${lessonId}`, {
        headers: getAuthHeaders(),
      });
      setExercises(response.data.data || []);
    } catch (error) {
      console.error("Erreur récupération exercices", error);
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

  const handleDeleteExercise = async (id) => {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    try {
      await axios.delete(`${API_URL}/exercises/${id}`, {
        headers: getAuthHeaders(),
      });
      setExercises(exercises.filter(e => e.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression de l'exercice");
    }
  };

  // -------- IA GENERATE ----------
  const handleAIGenerateExercise = async () => {
    setAiGenLoading(true);
    setAiGenError('');
    setAiExercisePDF(null);
    try {
      const response = await axios.post(
        `${API_URL}/exercises/ai-generate-exercise?course_id=${lessonId}`,
        {}, // body vide
        { headers: getAuthHeaders() }
      );
      if (response.data?.pdf_url) {
        setAiExercisePDF(response.data.pdf_url);
      } else {
        setAiGenError("Erreur : PDF non généré.");
      }
    } catch (err) {
      setAiGenError(
        err.response?.data?.error ||
        "Erreur lors de la génération automatique."
      );
    } finally {
      setAiGenLoading(false);
    }
  };
  // -------- FIN IA GENERATE ----------

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

  if (loading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl text-center max-w-md shadow-lg border border-red-100">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-lessons')}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition"
          >Retour</button>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const courseData = lesson;
  const pdfData = courseData.files || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER identique dashboard */}
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

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 md:p-12 mb-8">
            {/* Top header row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-2 mr-2 mt-1 border ${courseData.is_published ? BADGE_STYLES.published : BADGE_STYLES.draft}`}>
                    {courseData.is_published ? <>✔ Publié</> : <>⏳ Brouillon</>}
                  </span>
                  {courseData.title}
                </h1>
                <span className="text-xs text-gray-400 font-mono block pt-2">
                  Créé le : {new Date(courseData.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <button
                onClick={() => navigate('/my-lessons')}
                className="inline-flex items-center bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 border border-gray-200 font-medium px-4 py-2 rounded-xl transition"
              >
                ← Retour à la liste
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-14">
              <div className="md:col-span-7">
                {courseData.description && (
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{courseData.description}</p>
                  </div>
                )}
                {courseData.order_no && (
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <span className="mr-2">📊</span>
                    <span className="font-medium">Ordre :</span>
                    <span className="ml-1">{courseData.order_no}</span>
                  </div>
                )}
                {courseData.video_url && (
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Vidéo du cours</h3>
                    <a
                      href={courseData.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800 underline font-medium break-words"
                    >
                      {courseData.video_url}
                    </a>
                  </div>
                )}
              </div>
              <div className="md:col-span-5">
                {pdfData.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-blue-700 mb-2">📄 PDF du cours</h3>
                    <ul>
                      {pdfData.map((pdf, index) => (
                        <li key={index} className="mb-2 break-all">
                          <a
                            href={`${API_URL.replace('/api', '')}/uploads/courses/${pdf.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium underline gap-2"
                          >{pdf.file_name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ----------- AJOUT DU BOUTON IA EXERCICE ----------- */}
            <div className="flex flex-col gap-2 mb-8">
              <button
                onClick={handleAIGenerateExercise}
                disabled={aiGenLoading}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow flex gap-2 items-center transition ${aiGenLoading ? "opacity-50 cursor-wait" : ""}`}
                type="button"
              >
                🤖 Générer exercice IA
                {aiGenLoading && <span className="ml-2 animate-spin">⏳</span>}
              </button>

              {aiGenError && (
                <div className="text-red-600 font-semibold mb-2">{aiGenError}</div>
              )}
              {aiExercisePDF && (
                <div className="flex flex-col bg-indigo-50 border border-indigo-100 rounded-xl p-4 my-2 gap-2 max-w-sm">
                  <span className="font-semibold text-indigo-700 mb-1">Exercice généré :</span>
                  <a
                    href={`http://localhost:5000${aiExercisePDF}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 underline hover:text-indigo-900 font-semibold flex items-center gap-2"
                  >
                    📄 Télécharger l’exercice généré
                  </a>
                  <iframe
                    src={aiExercisePDF}
                    className="w-full h-40 rounded shadow border mt-2"
                    title="Aperçu exo IA"
                  />
                </div>
              )}
            </div>
            {/* -------- FIN DU BOUTON IA EXERCICE -------- */}

            {/* Exercices */}
            <div className="mt-8 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">📘 Exercices du cours</h3>
                <button
                  onClick={() => navigate(`/add-exercise/${lessonId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex gap-1 items-center"
                >
                  ➕ Ajouter un exercice
                </button>
              </div>
              {exercises.length === 0 ? (
                <p className="text-gray-500">Aucun exercice disponible.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-5">
                  {exercises.map(ex => (
                    <li key={ex.id} className="p-5 border rounded-xl bg-blue-50 border-blue-100/70 shadow flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold mb-1">{ex.title}</h4>
                        <p className="text-gray-600 text-sm mb-1">{ex.description}</p>
                        {ex.pdf_file && (
                          <a
                            href={`${API_URL.replace('/api', '')}/uploads/exercises/${ex.pdf_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm flex items-center gap-2 mt-1"
                          >
                            📄 Voir PDF
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 flex-nowrap shrink-0">
                        <button
                          onClick={() => navigate(`/edit-exercise/${ex.id}`)}
                          className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold rounded-lg transition"
                        >
                          ✏ Modifier
                        </button>
                        <button
                          onClick={() => navigate(`/view-exercise/${ex.id}`)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                        >
                          👁 Voir
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition"
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Footer actions */}
            <div className="flex flex-col md:flex-row gap-4 pt-4 md:pt-2">
              <button
                onClick={() => navigate(`/edit-lesson/${lessonId}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow font-semibold transition"
              >✏️ Modifier le cours</button>
              <button
                onClick={() => navigate('/my-lessons')}
                className="flex-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
              >Retour à la liste des cours</button>
            </div>
          </div>
        </div>
        {/* Dashboard à droite – MINI KPI INLINE PUIS 2 COLONNES EN DESSOUS */}
        <aside className="lg:col-span-5 order-1 lg:order-2 mb-12 lg:mb-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
            <MiniKpiCard label="Total cours" value={totalCourses} icon="📚" accent="blue" />
            <MiniKpiCard label="Publiés" value={totalPublished} icon="✅" accent="green" />
            <MiniKpiCard label="Brouillons" value={totalDrafts} icon="✏️" accent="orange" />
            <MiniKpiCard label="Étudiants" value={demoStudents} icon="🧑‍🎓" accent="purple" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Graphe camembert */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-3 text-blue-700 text-center">Répartition des cours</h3>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <LegendDot color={COLORS[0]} label="Publié" value={totalPublished} />
                <LegendDot color={COLORS[1]} label="Brouillon" value={totalDrafts} />
              </div>
            </div>
            {/* Derniers cours */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow p-4">
              <h3 className="text-base font-bold mb-3 text-blue-700">Derniers cours créés</h3>
              {lastLessons.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun cours créé récemment.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {lastLessons.map((course) => (
                    <li key={course.id} className="py-2 flex flex-col gap-1 text-xs">
                      <span className="font-semibold text-gray-900 mr-2">{course.title}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border
                        ${course.is_published ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {course.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="text-[11px] text-gray-500">{new Date(course.created_at).toLocaleDateString('fr-FR')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ----------- Mini KPI Card ----------
function MiniKpiCard({ label, value, icon, accent }) {
  const accentColor = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500"
  }[accent];
  return (
    <div className="bg-white shadow border border-gray-100 rounded-xl p-2 text-center flex flex-col items-center min-w-[60px] max-w-[100px] transition-transform hover:scale-[1.04]">
      <div className={`w-7 h-7 flex items-center justify-center mb-1 rounded-lg text-base font-bold ${accentColor} shadow`}>
        {icon}
      </div>
      <div className="text-base font-extrabold text-gray-900">{value}</div>
      <div className="text-gray-600 mt-0.5 text-[11px] font-semibold truncate">{label}</div>
    </div>
  );
}
function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
      <span>{label} <span className="font-semibold">{value}</span></span>
    </div>
  );
}

export default ViewLesson;