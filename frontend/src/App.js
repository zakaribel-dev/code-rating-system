import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SubmitPage from './pages/SubmitPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import ExerciseBuilder from "./pages/ExerciseBuilder";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/my-submissions" element={<MySubmissionsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/ExerciseBuilder" element={<ExerciseBuilder />} />
        <Route path="/AvailableExercises" element={<ExerciseBuilder />} />

      </Routes>
    </Router>
  );
}

export default App;
