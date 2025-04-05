import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SubmitForm from "../components/SubmitForm";
import StatusDisplay from "../components/StatusDisplay";

const SubmitPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [exercise, setExercise] = useState("");
  const [exerciseDetails, setExerciseDetails] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token) return navigate("/login");
    if (role === "admin") return navigate("/exerciseBuilder");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const updateStatusParams = (email, exerciseId) => {
    setEmail(email);
    setExercise(exerciseId);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold"> Soumission d'exercice</h2>
        <div className="space-x-3">
          <Link to="/my-submissions" className="text-blue-600 underline">
            Mes soumissions
          </Link>
          <button onClick={handleLogout} className="text-red-600 underline">
            Déconnexion
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Connecté en tant que : <strong>{email}</strong>
      </p>

      <SubmitForm
        onStatusUpdate={updateStatusParams}
        onExerciseSelected={setExerciseDetails}
      />

      {exerciseDetails && (
        <div className="mt-6 p-4 bg-gray-50 border-l-4 border-blue-400 rounded">
          <h3 className="text-md font-semibold mb-2">
           Énoncé de l'exercice :
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {exerciseDetails.description || "Aucune description fournie."}
          </p>
        </div>
      )}

      {email && exercise && <StatusDisplay exercise={exercise} />}
    </div>
  );
};

export default SubmitPage;
