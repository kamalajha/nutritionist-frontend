import { Bell, Menu, X, UserCircle, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const userName = localStorage.getItem("full_name");
  const userRole = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    localStorage.removeItem("token"); // Token bhi delete karein
    window.location.href = "/login";
  };

  useEffect(() => {
    const pollForMeeting = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // ✅ FIX 1: Single quotes ki jagah Backticks (`) use karein
        const res = await axios.get(`${API_URL}/notifications/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // ✅ FIX 2: Safety Check - Check karein ki data array hai ya nahi
        if (res.data && Array.isArray(res.data)) {
          const latestMeeting = res.data.find(n => 
            !n.read_at && n.message?.includes("https://meet.jit.si")
          );

          if (latestMeeting) {
            // Meeting link extract logic
            const link = latestMeeting.message.includes(": ") 
              ? latestMeeting.message.split(": ")[1] 
              : latestMeeting.message;

            if (window.confirm("🚀 Doctor has started the session! Join now?")) {
              window.open(link, "_blank");
              
              // Mark as read taaki pop-up dobara na aaye
              await axios.put(`${API_URL}/notifications/${latestMeeting.notification_id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          }
        }
      } catch (err) {
        // Polling error ko silence karein ya clean log dikhayein
        console.error("Polling error: Check if API_URL is correct or Token is valid");
      }
    }, 7000); // interval thoda badha diya (7s) taaki server par load kam ho

    return () => clearInterval(pollForMeeting);
  }, []);

  return (
    <nav className="bg-[#FFF9F4] border-b border-orange-100 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/home" className="text-2xl font-bold text-orange-500">
          Track<span className="text-gray-800">Intake</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium items-center">
          <Link to="/home" className="hover:text-orange-500">Home</Link>
          <Link to="/appointments" className="hover:text-orange-500">Appointments</Link>
          {userRole === 'nutritionist' && (
            <Link to="/manage-slots" className="hover:text-orange-500">Manage Slots</Link>
          )}
          <button onClick={handleLogout} className="text-red-500 font-bold hover:underline">
            Logout
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <NotificationBell /> 

          {userRole && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border shadow-sm ${
              userRole === 'nutritionist' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
              {userRole === 'nutritionist' ? <ShieldCheck size={14} /> : <UserCircle size={14} />}
              <span>{userRole}</span>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col mt-4 bg-white rounded-xl shadow-md p-4 space-y-3">
          <Link to="/home" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/appointments" onClick={() => setOpen(false)}>Appointments</Link>
          {userRole === 'nutritionist' && (
            <Link to="/manage-slots" onClick={() => setOpen(false)}>Manage Slots</Link>
          )}
          <button onClick={handleLogout} className="text-left text-red-500">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;