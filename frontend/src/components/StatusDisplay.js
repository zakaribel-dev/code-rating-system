import React, { useState } from 'react';
import axios from 'axios';

const StatusDisplay = ({ exercise }) => {
  const [status, setStatus] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${apiUrl}/status`, {
        params: { exercise },
        headers: { Authorization: token }
      });
      setStatus(res.data);
    } catch {
      setStatus({ status: 'Aucune soumission trouvée', score: '-' });
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={fetchStatus}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
         Vérifier le statut
      </button>

      {status && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <p><strong>Statut :</strong> {status.status}</p>
          <p><strong>Score :</strong> {status.score}%</p>
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
