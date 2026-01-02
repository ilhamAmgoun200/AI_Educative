import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { getAuthHeaders } from "../utils/auth";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    setNotifications(res.data.data || []);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    await axios.put(
      `${API_URL}/notifications/${id}/read`,
      {},
      { headers: getAuthHeaders() }
    );
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded shadow-lg z-50">
          {notifications.length === 0 && (
            <p className="p-4 text-slate-400">Aucune notification</p>
          )}

          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 border-b border-slate-700 ${
                !n.is_read ? "bg-slate-700" : ""
              }`}
              onClick={() => markAsRead(n.id)}
            >
              <p className="font-semibold text-white">{n.title}</p>
              <p className="text-sm text-slate-400">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
