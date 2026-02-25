import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await axios.post(
        `${API_URL}/auth/token`,
        formData
      );

      const token = res.data.access_token;
      const userData = decodeToken(token);

      if (!userData) throw new Error("Invalid token");

      const role = userData.role;
      const userEmail = userData.sub;
      const userName = userEmail.split("@")[0];

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user_name", userName);

      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Incorrect credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg outline-orange-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg outline-orange-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;