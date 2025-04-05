import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AvailableExercises from "../components/AvailableExercises";

const ExerciseBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState([]);
  const [language, setLanguage] = useState("Python");
  const [input, setInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    setEmail(email);

    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/submit");

    fetchExercises();
  }, [navigate]);

  const fetchExercises = async () => {
    try {
      const res = await axios.get(`${apiUrl}/exercises/with-submissions`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setExercises(res.data);
    } catch (err) {
      console.error("Erreur chargement exercices :", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${apiUrl}/exercises`,
        {
          title,
          description,
          language,
          input,
          expected_output: expectedOutput,
          course,
        },
        { headers: { Authorization: localStorage.getItem("token") } }
      );

      alert("Exercice ajouté !");
      setTitle("");
      setDescription("");
      setInput("");
      setExpectedOutput("");
      setCourse("");
      fetchExercises();
    } catch (err) {
      alert(" Erreur");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-4 mt-8"
      >
        <p className="mb-4 text-sm text-gray-600">
          Connecté en tant que : <strong>{email}</strong>
        </p>
        <button onClick={handleLogout} className="text-red-600 underline">
          Déconnexion
        </button>

        <h2 className="text-xl font-bold"> Ajouter un exercice</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="input w-full"
          required
        />
        <input
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Nom du cours (Ex: Cours 1)"
          className="input w-full"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="input w-full"
          rows={2}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input w-full"
        >
          <option value="Python">Python</option>
          <option value="C">C</option>
        </select>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Input (stdin, optionnel)"
          className="input w-full"
          rows={2}
        />

        <textarea
          value={expectedOutput}
          onChange={(e) => setExpectedOutput(e.target.value)}
          placeholder="Résultat attendu"
          className="input w-full"
          rows={2}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Enregistrer
        </button>
      </form>
      <AvailableExercises exercises={exercises} />
    </>
  );
};

export default ExerciseBuilder;
