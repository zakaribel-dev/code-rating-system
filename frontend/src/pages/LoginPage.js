
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault(); 
  
    try {
      const res = await axios.post(`${apiUrl}/login`, { email });
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.email);
      localStorage.setItem("userRole", res.data.role);

  
      if (res.data.role === "admin") {
        navigate("/ExerciseBuilder");
      } else {
        navigate("/submit");
      }
  
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    }
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-6 shadow rounded w-96">
        <h2 className="text-2xl font-semibold mb-4">Connexion</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" className="input" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
