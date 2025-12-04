import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "./style/UserMenu.css";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/loginn');
    setIsOpen(false);
  };

  // Initiales pour l'avatar
  const initials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar rond */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        aria-label="Menu utilisateur"
      >
        {initials}
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
          {/* En-tête avec infos utilisateur */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>

          {/* Options du menu */}
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <span className="mr-3">👤</span>
              Mon Profil
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              <span className="mr-3">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;