import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Blogs from './pages/Blogs'
import Appointments from './pages/Appointments'
import Health from './pages/Health'
import Progress from './pages/Progress'
import Tools from './pages/Tools'
import Diet from './pages/Diet'
import Login from './pages/Login' // Login page import karein
import DoctorSlotManager from './pages/DoctorSlotManager' // Doctor Slot Manager page import karein

// --- Protected Route Logic ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Agar token nahi hai, toh login page par redirect kar do
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/health" element={<Health />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/manage-slots" element={<DoctorSlotManager />} />
        
        {/* Protected Routes (Inhe bina login ke access nahi kiya ja sakta) */}
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/progress" 
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diet" 
          element={
            <ProtectedRoute>
              <Diet />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App