import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Loader2, MessageSquare, MapPin } from "lucide-react";
import axios from "axios";

// Cashfree Initialization
const cashfree = window.Cashfree({
    mode: "sandbox", 
});
const API_URL = import.meta.env.VITE_API_URL;
const BookAppointmentModal = ({ nutritionist, onClose, rescheduling }) => {
  // Check if this is a slot booking from In-House flow
  const isSlotBooking = !!nutritionist.forceTime;
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(isSlotBooking ? "in_person" : "virtual");

  // Form States initialization
  const [formData, setFormData] = useState({
    date: nutritionist.forceDate || "",
    time: nutritionist.forceTime || "",
    concerns: ""
  });

  // Sync states for rescheduling or slot booking updates
  useEffect(() => {
    if (rescheduling) {
      setFormData({
        date: rescheduling.appointment_date,
        time: rescheduling.appointment_time,
        concerns: rescheduling.notes || ""
      });
      setMode(rescheduling.appointment_type);
    } else if (isSlotBooking) {
      setFormData(prev => ({
        ...prev,
        date: nutritionist.forceDate,
        time: nutritionist.forceTime
      }));
      setMode("in_person");
    }
  }, [rescheduling, nutritionist, isSlotBooking]);

  const handleChange = (e) => {
    if (isSlotBooking && (e.target.name === 'date' || e.target.name === 'time')) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
        setLoading(true);

        // Logic: Rescheduling
        if (rescheduling) {
            const updatePayload = {
                appointment_date: formData.date,
                appointment_time: formData.time, 
                notes: formData.concerns,
                appointment_type: mode
            };
            await axios.put(
                `${API_URL}/appointments/${rescheduling.appointment_id}`,
                updatePayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Appointment rescheduled successfully!");
            onClose();
            window.location.reload();
            return;
        }

        // Logic: Create New Payment Order
        const payload = { 
            nutritionist_id: nutritionist?.nutritionist_id,
            appointment_date: formData.date,
            appointment_time: formData.time,
            appointment_type: mode,
            notes: formData.concerns
        };

        const response = await axios.post(
            `${API_URL}/appointments/create-payment-order`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { payment_session_id, order_id } = response.data;
        if (!payment_session_id) throw new Error("Session creation failed");

        const result = await cashfree.checkout({
            paymentSessionId: payment_session_id,
            redirectTarget: "_modal",
        });

        if (result.error) {
            alert(`Payment Error: ${result.error.message}`);
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const verifyRes = await axios.get(
                `${API_URL}/appointments/verify-payment/${order_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (verifyRes.data.status === "success") {
                alert("Payment Successful! Appointment Confirmed.");
                onClose();
                window.location.reload();
            } else {
                alert("Payment was not successful. Please try again.");
            }
        }
    } catch (error) {
        console.error("Booking Error:", error);
        alert(error.response?.data?.detail || error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-xs text-gray-500">With {nutritionist.full_name || nutritionist.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          
          {/* Date & Time (Read-only for slot booking) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Calendar size={16} className="text-orange-500" /> Date
              </label>
              <input
                type="date"
                name="date"
                required
                readOnly={isSlotBooking}
                value={formData.date}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none text-sm ${isSlotBooking ? 'bg-gray-100 text-gray-500 border-transparent' : 'border-gray-200 focus:ring-2 focus:ring-orange-500'}`}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <Clock size={16} className="text-orange-500" /> Time
              </label>
              <input
                type="time"
                name="time"
                required
                readOnly={isSlotBooking}
                value={formData.time}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 outline-none text-sm ${isSlotBooking ? 'bg-gray-100 text-gray-500 border-transparent' : 'border-gray-200 focus:ring-2 focus:ring-orange-500'}`}
              />
            </div>
          </div>

          {/* Mode Selection (Hide for slot booking) */}
          {!isSlotBooking ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setMode("virtual")}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition ${mode === 'virtual' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
              >
                Virtual
              </button>
              <button 
                type="button"
                onClick={() => setMode("in_person")}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition ${mode === 'in_person' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
              >
                In person
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-blue-50 text-orange-500 rounded-xl border border-blue-100">
               <MapPin size={18} />
               <span className="text-sm font-medium">Confirmed: In-House Consultation</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
              <MessageSquare size={16} className="text-orange-500" /> Health Concerns
            </label>
            <textarea
              name="concerns"
              rows="3"
              value={formData.concerns}
              onChange={handleChange}
              placeholder="Briefly describe your health goals or problems..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? <><Loader2 className="animate-spin" /> Booking...</> : ` Confirm Appointment`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;