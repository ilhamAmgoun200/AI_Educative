import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import httpClient from "../api/httpClient";
import { Link } from "react-router-dom";

export default function Subjects() {
  const { user } = useContext(AuthContext); // utilisateur connecté
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Déterminer l'endpoint selon le rôle
        const isTeacher = user?.role?.name === "teacher" || user?.role?.name === "professor";
        const endpoint = isTeacher
          ? "/users/me?populate[subjects][populate][lessons]=*"
          : "/subjects?populate[author]=true&populate[lessons]=true"; // Utiliser populate comme demandé

        const { data } = await httpClient.get(endpoint);

        // Si prof : ses propres matières
        if (isTeacher) {
          setSubjects(data.subjects || []);
        }
        // Si étudiant : toutes les matières
        else if (user?.role?.name === "student") {
          setSubjects(data.data || []);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Erreur de récupération des subjects :", err);
        setError("Impossible de charger les matières. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchSubjects();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full relative z-10">
        <div className="bg-gray-50 rounded-2xl shadow-2xl p-8">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center w-fit"
            >
              <span className="mr-2">←</span>
              Retour au Dashboard
            </Link>
          </div>

          {/* En-tête */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">📚</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {user?.role?.name === "teacher" || user?.role?.name === "professor"
                ? "Mes Matières"
                : "Liste des Matières Disponibles"}
            </h1>
            <p className="text-slate-600">
              {user?.role?.name === "teacher" || user?.role?.name === "professor"
                ? "Voici vos matières et leurs leçons."
                : "Explorez les cours proposés par vos professeurs."}
            </p>
          </div>

          {/* Chargement */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full animate-spin mr-2"></div>
              <p className="text-slate-600">Chargement des matières...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Liste des matières */}
          {!isLoading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.length === 0 ? (
                <p className="text-center text-slate-600 col-span-full">
                  Aucune matière trouvée.
                </p>
              ) : (
                 subjects.map((subject) => {
                   // Extraire les données selon le format de réponse
                   const info =
                     user?.role?.name === "teacher" || user?.role?.name === "professor"
                       ? subject
                       : subject.attributes || subject;

                   // Extraire les leçons (peut être dans data ou directement)
                   let lessons = [];
                   if (user?.role?.name === "teacher" || user?.role?.name === "professor") {
                     lessons = info.lessons || [];
                   } else {
                     // Format avec populate[lessons]=true
                     lessons = info.lessons?.data || info.lessons || [];
                   }

                   // Extraire le nom du professeur (author)
                   let authorName = "Inconnu";
                   if (user?.role?.name === "teacher" || user?.role?.name === "professor") {
                     authorName = user.username;
                   } else {
                     // Format avec populate[author]=true
                     const author = info.author?.data || info.author;
                     authorName = author?.attributes?.username || author?.username || "Inconnu";
                   }

                   return (
                     <div
                       key={subject.id}
                       className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
                     >
                       {/* Nom du subject */}
                       <div className="flex items-start justify-between mb-3">
                         <h3 className="text-xl font-bold text-slate-800 flex-1">
                           {info.subject_name}
                         </h3>
                         {info.level && (
                           <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                             {info.level}
                           </span>
                         )}
                       </div>

                       {/* Nom du professeur */}
                       <div className="mb-4 pb-3 border-b border-gray-200">
                         <p className="text-slate-600 text-sm flex items-center">
                           <span className="mr-2">👨‍🏫</span>
                           <span className="font-semibold text-slate-700">Professeur :</span>
                           <span className="ml-2 text-blue-600">{authorName}</span>
                         </p>
                       </div>

                       {/* Description si disponible */}
                       {info.description && (
                         <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                           {info.description}
                         </p>
                       )}

                       {/* Liste des cours (lessons) */}
                       <div className="mt-4">
                         <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                           <span className="mr-2">📚</span>
                           Cours ({lessons.length}) :
                         </h4>
                         <ul className="space-y-2 text-slate-600 text-sm max-h-48 overflow-y-auto">
                           {lessons && lessons.length > 0 ? (
                             lessons.map((lesson) => {
                               const lessonInfo = lesson.attributes || lesson;
                               const title = lessonInfo.title || "Sans titre";
                               const pdfUrl = lessonInfo.pdf_url;
                               
                               return (
                                 <li
                                   key={lesson.id}
                                   className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                 >
                                   <div className="flex items-center space-x-2 flex-1">
                                     <span>📘</span>
                                     <span className="truncate">{title}</span>
                                   </div>
                                   {pdfUrl && (
                                     <a
                                       href={pdfUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="ml-2 text-blue-600 hover:text-blue-700"
                                       onClick={(e) => e.stopPropagation()}
                                       title="Télécharger le PDF"
                                     >
                                       📄
                                     </a>
                                   )}
                                 </li>
                               );
                             })
                           ) : (
                             <li className="text-slate-400 italic text-center py-2">
                               Aucun cours disponible
                             </li>
                           )}
                         </ul>
                       </div>

                       {/* Bouton voir les détails pour les étudiants */}
                       {user?.role?.name === "student" && (
                         <Link
                           to={`/subjects/${subject.id}`}
                           className="inline-block mt-4 w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                         >
                           Voir les détails →
                         </Link>
                       )}
                     </div>
                   );
                 })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            © 2025 LearnAI. Apprenez avec l’intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
