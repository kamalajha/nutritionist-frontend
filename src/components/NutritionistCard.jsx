import React from 'react';
import { Star, MapPin, Phone, Clock, ShieldCheck, Calendar } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
const NutritionistCard = ({ nutritionist, onBook }) => {
  // Backend Join query aur naye columns se ye data aayega
  const {
    full_name,
    specialization,
    bio,
    hourly_rate,
    rating,
    total_sessions,
    accepting_patients,
    location,
    contact_number, // User table se add kiya hua column
    profile_image   // User table se aayi hui photo URL
  } = nutritionist;
// console.log("Nutritionist data in card:", nutritionist)
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-md border border-gray-100 flex flex-col h-full max-w-md mx-auto hover:shadow-xl transition-all duration-300 group">
      
      {/* Header: Photo & Status */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4">
          {/* Profile Photo Logic */}
          <div className="relative">
            {profile_image ? (
              <img 
                src={profile_image} 
                alt={full_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 p-0.5 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {full_name ? full_name[0] : 'N'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {full_name || "Specialist"}
            </h3>
            <p className="text-blue-500 text-sm font-bold uppercase tracking-tight">{specialization}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={14} className="fill-orange-400 text-orange-400" />
              <span className="text-sm font-black text-gray-600">{rating || "4.8"}</span>
              <span className="text-xs text-gray-400 font-medium">({total_sessions || 0} reviews)</span>
            </div>
          </div>
        </div>
        
        {/* Availability Badge */}
        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest flex items-center gap-1.5 shadow-sm border ${
          accepting_patients 
          ? 'bg-green-50 text-green-600 border-green-100' 
          : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${accepting_patients ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {accepting_patients ? 'AVAILABLE' : 'BUSY'}
        </span>
      </div>

      {/* Bio Section */}
      <div className="bg-gray-50/50 p-4 rounded-2xl mb-6">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic">
          "{bio || "Expert nutritionist dedicated to helping you achieve your health goals through personalized diet plans."}"
        </p>
      </div>

      {/* Info Grid: Charges, Location, Contact,Experience */}
     <div className="grid grid-cols-2 gap-4 mb-8 border-t border-gray-100 pt-6">
  {/* Charges */}
  <div className="flex items-center gap-3">
    <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shrink-0">
      <Clock size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Charges</p>
      <p className="font-bold text-gray-900 text-sm mt-0.5">₹{hourly_rate}/hr</p>
    </div>
  </div>

  {/* Location */}
  <div className="flex items-center gap-3">
    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 shrink-0">
      <MapPin size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Location</p>
      <p className="font-bold text-gray-900 text-sm mt-0.5">{location || "Indore"}</p>
    </div>
  </div>

  {/* Contact */}
  <div className="flex items-center gap-3">
    <div className="p-2.5 bg-green-50 rounded-xl text-green-500 shrink-0">
      <Phone size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Contact</p>
      <p className="font-bold text-gray-900 text-sm mt-0.5">{nutritionist.contact || "Connect"}</p>
    </div>
  </div>

  {/* Experience */}
  <div className="flex items-center gap-3">
    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500 shrink-0">
      <Calendar size={20} />
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Experience</p>
      <p className="font-bold text-gray-900 text-sm mt-0.5">{nutritionist.experience} </p>
    </div>
  </div>
</div>

      {/* Book Appointment Button */}
     <div className='mt-auto'>
       <button 
        onClick={onBook}
        disabled={!accepting_patients}
        className={`w-full font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
          accepting_patients 
          ? 'bg-[#FF5F38] text-white font-semibold   hover:bg-[#e55532] shadow-orange-100 hover:shadow-orange-200' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        {accepting_patients ? 'BOOK APPOINTMENT NOW' : 'NOT ACCEPTING PATIENTS'}
      </button>
     </div>
    </div>
  );
};

export default NutritionistCard;