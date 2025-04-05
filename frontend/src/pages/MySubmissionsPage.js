import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MySubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
  
    if (!token) return navigate("/login");
    if (role === "admin") return navigate("/ExerciseBuilder");
  }, [navigate]);
  

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${apiUrl}/my-submissions`, {
          headers: { Authorization: token }
        });
        setSubmissions(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
        alert('Erreur lors du chargement des soumissions');
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFiltered(submissions);
    } else {
      setFiltered(submissions.filter(s => s.status === filterStatus));
    }
  }, [filterStatus, submissions]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Mes soumissions</h2>
        <button
          onClick={() => navigate('/submit')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
         Retour à la soumission
        </button>
      </div>

      <div className="mb-4">
        <label className="mr-2">Filtrer par statut :</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="corrected">Corrigé</option>
          <option value="error">Erreur</option>
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Cours</th>
            <th className="border px-4 py-2">Exercice</th>
            <th className="border px-4 py-2">Langage</th>
            <th className="border px-4 py-2">Statut</th>
            <th className="border px-4 py-2">Score</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4">Aucune soumission</td>
            </tr>
          ) : (
            filtered.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{s.course}</td>
                <td className="border px-4 py-2">{s.exercise}</td>
                <td className="border px-4 py-2">{s.language}</td>
                <td className="border px-4 py-2">{s.status}</td>
                <td className="border px-4 py-2">{s.score ?? '-'}</td>
                <td className="border px-4 py-2">{new Date(s.submitted_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MySubmissionsPage;
