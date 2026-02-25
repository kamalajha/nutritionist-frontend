import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, Calendar, CheckCircle, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const DoctorSlotManager = () => {
  const [slots, setSlots] = useState({ available: [], booked: [] });
  const [formData, setFormData] = useState({ date: "", start: "", end: "" });

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchSlots = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/nutritionists/slots/my-slots`,
        authHeader()
      );

      setSlots({
        available: res.data.available_slots || [],
        booked: res.data.booked_slots || [],
      });
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Login again.");
      }
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/nutritionists/add-manual-slot`,
        null,
        {
          params: formData,
          ...authHeader(),
        }
      );

      setFormData({ date: "", start: "", end: "" });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add slot");
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Delete this slot?")) return;

    try {
      await axios.delete(
        `${API_URL}/nutritionists/remove-slot/${id}`,
        authHeader()
      );
      fetchSlots();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="text-orange-500" /> Slot Management
      </h2>

      {/* Add Slot */}
      <form
        onSubmit={handleAddSlot}
        className="bg-white p-6 rounded-xl shadow mb-8 flex gap-4 flex-wrap"
      >
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          required
          value={formData.start}
          onChange={(e) => setFormData({ ...formData, start: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          required
          value={formData.end}
          onChange={(e) => setFormData({ ...formData, end: e.target.value })}
          className="border p-2 rounded"
        />
        <button className="bg-orange-500 text-white px-4 rounded flex items-center gap-2">
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-green-700 mb-4">
            <CheckCircle className="inline" /> Available
          </h3>

          {slots.available.map((s) => (
            <div
              key={s.slot_id}
              className="flex justify-between p-3 bg-green-50 mb-2 rounded"
            >
              <span>{s.date} | {s.start_time} - {s.end_time}</span>
              <Trash2
                onClick={() => handleRemove(s.slot_id)}
                className="cursor-pointer text-red-500"
              />
            </div>
          ))}
        </div>

        {/* Booked */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-blue-700 mb-4">
            <Lock className="inline" /> Booked
          </h3>

          {slots.booked.map((s) => (
            <div key={s.slot_id} className="p-3 bg-blue-50 rounded mb-2">
              {s.date} | {s.start_time} - {s.end_time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorSlotManager;