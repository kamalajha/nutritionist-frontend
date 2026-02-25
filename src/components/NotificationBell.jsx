import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Video } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const NotificationBell = () => {
  // 1. Initial state hamesha empty array rakho taaki .filter crash na ho
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = async () => {
    const activeToken = localStorage.getItem("token");
    if (!activeToken) return;

    try {
      // API call mein URL string literal fix kiya `${API_URL}`
      const res = await axios.get(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${activeToken}` } 
      });
      
      // 2. Safety Check: Agar data array nahi hai toh empty array set karo
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);

      // Meeting link detection logic
      const meetingNotif = data.find(n => !n.read_at && n.message?.includes("https://meet.jit.si"));
      if (meetingNotif) {
        handleMeetingPopup(meetingNotif);
      }
    } catch (err) { 
      console.error("Notif Error:", err.response?.status); 
      setNotifications([]); // Error aane par array khali rakho taaki render na tute
    }
  };

  const handleMeetingPopup = (notif) => {
    const parts = notif.message.split("Join here: ");
    const meetingLink = parts.length > 1 ? parts[1] : notif.message;
    
    // Window confirm logic
    if (window.confirm(`🚀 Session Started!\n\nJoin Now?`)) {
      window.open(meetingLink, '_blank');
      markAsRead(notif.notification_id);
    }
  };

  const markAsRead = async (id) => {
    const activeToken = localStorage.getItem("token");
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      fetchNotifs(); 
    } catch (err) { console.error("Mark as read error:", err); }
  };

  useEffect(() => {
    const initialToken = localStorage.getItem("token");
    if (initialToken) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 7000); 
      return () => clearInterval(interval);
    }
  }, []);

  // 3. Unread Count calculation with extra safety
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => !n.read_at).length 
    : 0;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:text-orange-500 transition relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-orange-100 rounded-2xl shadow-2xl z-[100] overflow-hidden">
          <div className="p-4 bg-orange-50 font-bold text-gray-800 border-b border-orange-100 flex justify-between">
            <span>Recent Alerts</span>
            {unreadCount > 0 && <span className="text-[10px] text-orange-600 uppercase tracking-wider">{unreadCount} New</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400 italic">No new alerts</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.notification_id} 
                  onClick={() => !n.read_at && markAsRead(n.notification_id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!n.read_at ? 'bg-orange-50/40 hover:bg-orange-50/60' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex gap-3">
                    {n.message?.includes("https") ? <Video size={16} className="text-orange-500 mt-1 shrink-0" /> : <Bell size={16} className="text-gray-400 mt-1 shrink-0" />}
                    <div>
                      <p className={`text-xs ${!n.read_at ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{n.title || "Update"}</p>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;