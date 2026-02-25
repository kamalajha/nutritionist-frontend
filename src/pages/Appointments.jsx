import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Video, XCircle, RefreshCw, Loader2, MapPin } from 'lucide-react';
import NutritionistCard from '../components/NutritionistCard.jsx';
import BookAppointmentModal from '../components/BookAppointmentModal.jsx';

const API_URL = import.meta.env.VITE_API_URL;
const Appointments = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal control ke liye
  // NEW STATES for In-House Logic
  const [nutritionistType, setNutritionistType] = useState(null); // 'in-house' or 'expert'
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic: Filter out cancelled and sort (Existing)
  const sortedAppointments = [...myAppointments]
    .filter(app => app.status !== 'cancelled')
    .sort((a, b) => {
      if (a.status === 'scheduled' && b.status === 'confirmed') return 1;
      return 0;
    });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const [appRes, nutriRes] = await Promise.all([
        axios.get(`${API_URL}/appointments/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/nutritionists/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMyAppointments(appRes.data);
      setNutritionists(nutriRes.data);
      console.log("debug data aa rha ki nai:",nutriRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic: Fetch slots for In-house 
 const fetchSlots = async (doctorId, date) => {
  if (!doctorId) return;
  
  const token = localStorage.getItem('token'); // Token nikalna zaroori hai
  
  try {
    const response = await axios.get(
      `${API_URL}/nutritionists/slots/available/${doctorId}?date=${date}`, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // Token yahan jayega
      }
    );

    // Axios mein seedha response.data use karte hain
    setAvailableSlots(response.data); 
    
    console.log("Slots loaded:", response.data);
  } catch (error) {
    console.error("Error fetching slots:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      alert("Session Expired login again..");
    }
    setAvailableSlots([]); 
  }
};
 const handleInHouseBooking=(slotTime)=>{
  setSelectedNutritionist({
    ...selectedNutritionist,
    appointment_time: slotTime,
    appointment_date: selectedDate ,
    appointment_type: 'in-house',
    isAutoSelected:true
  })
 }
  const handleSessionAction = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/appointments/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Do you want to cancel this appointment?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        alert("Appointment has been cancelled.");
        fetchData();
      }
    } catch (error) {
      alert("Could not cancel appointment.");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    if (timeStr.includes(':')) return timeStr.slice(0, 5);
    return timeStr;
  };

  const getMeetingUrl = (app) => {
    if (app.meeting_url) return app.meeting_url;
    const meetingId = app.appointment_id.toString().substring(0, 8);
    return `https://meet.jit.si/nutrition-${meetingId}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 min-h-screen bg-[#FFF9F4]">
      {userRole === 'nutritionist' ? (
        /* NUTRITIONIST DASHBOARD (UNCHANGED) */
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Video className="text-orange-500" /> Today's Schedule
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map((app) => (
                  <li key={app.appointment_id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{app.user?.full_name || "Patient"}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(app.start_time || app.appointment_time)} • {app.appointment_type}
                      </p>
                      {app.status === 'completed' && app.actual_start_time && (
                         <p className="text-xs text-green-600 font-bold mt-1">Session Completed</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {app.status === 'confirmed' && app.appointment_type === 'virtual' && (
                        <>
                          <button 
                            onClick={() => { handleSessionAction(app.appointment_id, 'start-session'); window.open(getMeetingUrl(app), '_blank'); }}
                            className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 transition"
                          >
                            Join & Start
                          </button>
                          <button 
                            onClick={() => handleSessionAction(app.appointment_id, 'end-session')}
                            className="border border-red-500 text-red-500 px-6 py-2 rounded-xl font-semibold hover:bg-red-100 transition"
                          >
                             Complete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="p-10 text-center text-gray-400 italic">No appointments for today.</p>
              )}
            </ul>
          </div>
        </section>
      ) : (
        /* USER DASHBOARD */
        <>
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Calendar className="text-orange-500" /> My Schedule
            </h2>
            <div className="grid gap-4">
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map((app) => {
                  const nutritionist = nutritionists.find(n => String(n.nutritionist_id) === String(app.nutritionist_id));
                  return (
                    <div key={app.appointment_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{nutritionist?.full_name || nutritionist?.name || "Specialist"}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                            <span>Date: {app.appointment_date}</span>
                            <span>Time:{formatTime(app.start_time || app.appointment_time)}</span>
                            <span className="flex items-center gap-1 capitalize">
                              {app.appointment_type === 'virtual' ? <Video size={14}/> : <MapPin size={14}/>} 
                              {app.appointment_type}
                            </span>
                            <span className={`font-bold uppercase px-2 py-0.5 rounded text-xs ${
                              app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              app.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              app.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {app.status === 'confirmed' && app.appointment_type === 'virtual' && (
                            <button 
                              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition" 
                              onClick={() => { handleSessionAction(app.appointment_id, 'start-session'); window.open(getMeetingUrl(app), '_blank'); }}
                            >
                              Join Meeting
                            </button>
                          )}
                          {app.status !== 'completed' && (
                            <>
                              <button className="border border-orange-400 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-50 transition" 
                                onClick={() => { setSelectedNutritionist(nutritionist); setRescheduling(app); }}>
                                Reschedule
                              </button>
                              <button className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition" 
                                onClick={() => handleCancel(app.appointment_id)}>
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 italic py-8">No scheduled appointments yet.</p>
              )}
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* NEW SECTION: TYPE SELECTION */}
          <section className="text-center space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-800">Book New Appointment</h2>
            <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => setNutritionistType('in-house')}
                  className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all w-64 ${nutritionistType === 'in-house' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-gray-100 bg-white hover:border-orange-200'}`}
                >
                  <div className="bg-orange-100 p-4 rounded-full mb-4 text-3xl">🏥</div>
                  <span className="text-xl font-bold text-gray-900">In-House</span>
                  <p className="text-sm text-gray-500 mt-2">Visit our clinic for a physical checkup</p>
                </button>

                <button 
                  onClick={() => setNutritionistType('expert')}
                  className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all w-64 ${nutritionistType === 'expert' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-gray-100 bg-white hover:border-orange-200'}`}
                >
                  <div className="bg-green-100 p-4 rounded-full mb-4 text-3xl">🌟</div>
                  <span className="text-xl font-bold text-gray-900">Expert</span>
                  <p className="text-sm text-gray-500 mt-2">Video call with top health specialists</p>
                </button>
            </div>
          </section>

          {/* CONDITIONAL CONTENT */}
          <section className="min-h-[400px]">
            {nutritionistType === 'in-house' ? (
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">In-House Consultation</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Choose Specialist</label>
                    <select 
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
                        onChange={(e) => {
                          const nutri = nutritionists.find(n => String(n.nutritionist_id) === String(e.target.value));
                          setSelectedNutritionist(nutri);
                          setIsModalOpen(false);
                          if(e.target.value) fetchSlots(e.target.value, selectedDate);
                        }}
                    >
                      <option value="">-- Select a Doctor --</option>
                      {nutritionists.filter(n => n.type === 'in-house').map(doc => (
                        <option key={doc.nutritionist_id} value={doc.nutritionist_id}>{doc.name || doc.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Select Date</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            if(selectedNutritionist) fetchSlots(selectedNutritionist.nutritionist_id, e.target.value);
                        }}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {selectedNutritionist && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">3. Available Time Slots</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {availableSlots.length > 0 ? (
                            availableSlots.map((slot, idx) => (
                                <button
                                    key={idx}
                                    disabled={!slot.is_available}
                                    onClick={() => {
                                      setSelectedNutritionist({
                                     ...selectedNutritionist, 
                                     forceTime: slot.start_time, 
                                     forceDate: selectedDate,
                                     appointment_type: 'in-house'
                                      });
                                      setIsModalOpen(true);
                                    }}
                                    className={`p-3 rounded-xl text-sm font-bold transition-all border ${slot.is_available ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500' : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'}`}
                                >
                                    {slot.start_time}
                                </button>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-400 py-4 italic">No slots available for this date.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : nutritionistType === 'expert' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95">
                {nutritionists.filter(n => n.type === 'expert').map((nutri) => (
                  <NutritionistCard key={nutri.nutritionist_id} nutritionist={nutri} onBook={() =>{ setSelectedNutritionist(nutri);
                    setIsModalOpen(true);
                  }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Calendar size={64} className="mb-4 opacity-20" />
                <p className="text-lg italic">Select a consultation type above to continue</p>
              </div>
            )}
          </section>
        </>
      )}

      {isModalOpen && selectedNutritionist && (
        <BookAppointmentModal 
          nutritionist={selectedNutritionist} 
          onClose={() => { 
            setIsModalOpen(false);
          //  setSelectedNutritionist(null); 
            setRescheduling(null); fetchData(); }} 
          rescheduling={rescheduling} 
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      )}
    </div>
  );
};

export default Appointments;