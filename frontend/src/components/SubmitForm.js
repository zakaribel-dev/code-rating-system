import React, { useState, useEffect } from "react";
import axios from "axios";

const SubmitForm = ({ onStatusUpdate, onExerciseSelected }) => {
  const [language, setLanguage] = useState("");
  const [course, setCourse] = useState("");
  const [exercise, setExercise] = useState("");
  const [file, setFile] = useState(null);

  const [groupedExos, setGroupedExos] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGroupedExercises = async () => {
      try {
        const res = await axios.get(`${apiUrl}/exercises/grouped`, {
          headers: { Authorization: token },
        });
        setGroupedExos(res.data);
      } catch (err) {
        console.error("Erreur chargement des exercices groupés :", err);
      }
    };

    fetchGroupedExercises();
  }, [apiUrl, token]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCourse("");
    setExercise("");
    onExerciseSelected(null);

    const filtered = groupedExos.filter((group) =>
      group.exercises.some((exo) => exo.language === lang)
    );
    setFilteredCourses(filtered);
  };

  const handleCourseChange = (selectedCourse) => {
    setCourse(selectedCourse);
    setExercise("");
    onExerciseSelected(null);

    const group = groupedExos.find((g) => g.course === selectedCourse);
    const filtered =
      group?.exercises.filter((exo) => exo.language === language) || [];
    setFilteredExercises(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Veuillez sélectionner un fichier");
    if (!exercise) return alert("Veuillez choisir un exercice");

    const formData = new FormData();
    formData.append("course", course);
    formData.append("exercise", exercise);
    formData.append("language", language);
    formData.append("code", file);

    try {
      await axios.post(`${apiUrl}/submit`, formData, {
        headers: { Authorization: token },
      });

      alert("Fichier soumis !");
      const email = localStorage.getItem("userEmail");
      onStatusUpdate(email, exercise);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la soumission");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="input"
        required
      >
        <option value=""> Choisir un langage</option>
        <option value="Python">Python</option>
        <option value="C">C</option>
      </select>

      {language && (
        <select
          value={course}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="input"
          required
        >
          <option value="">Choisir un cours</option>
          {filteredCourses.map((group) => (
            <option key={group.course} value={group.course}>
              {group.course}
            </option>
          ))}
        </select>
      )}

      {course && (
        <select
          value={exercise}
          onChange={(e) => {
            const exoId = e.target.value;
            setExercise(exoId);

            const selected = filteredExercises.find(
              (exo) => exo.id === parseInt(exoId)
            );
            if (selected && onExerciseSelected) {
              onExerciseSelected(selected);
            }
          }}
          className="input"
          required
        >
          <option value=""> Choisir un exercice</option>
          {filteredExercises.map((exo) => (
            <option key={exo.id} value={exo.id}>
              {exo.title}
            </option>
          ))}
        </select>
      )}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="input"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Soumettre
      </button>
    </form>
  );
};

export default SubmitForm;
