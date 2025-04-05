import React from "react";

const AvailableExercises = ({ exercises }) => {
  return (
    <div className="max-w-5xl mx-auto mt-14 mb-16">
      <h2 className="text-2xl font-semibold mb-6 text-center">
         Exercices disponibles ({exercises.length})
      </h2>

      {exercises.length === 0 ? (
        <p className="text-gray-600 text-sm text-center">
          Aucun exercice trouvé.
        </p>
      ) : (
        <div className="space-y-10">
          {exercises.map((exo) => (
            <div
              key={exo.id}
              className="border border-gray-200 rounded-xl shadow-sm p-6 bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  {exo.title}
                  <span className="text-sm text-gray-500 ml-2">
                    ({exo.language} / {exo.course})
                  </span>
                </h3>
              </div>

              {exo.submissions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Aucune soumission pour cet exercice.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border border-gray-300 rounded overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 border">Étudiant</th>
                        <th className="px-4 py-2 border">Statut</th>
                        <th className="px-4 py-2 border">Score</th>
                        <th className="px-4 py-2 border">Soumis le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exo.submissions.map((s, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border px-4 py-2">{s.user_email}</td>
                          <td className="border px-4 py-2">{s.status}</td>
                          <td className="border px-4 py-2">
                            {s.score ?? "-"}%
                          </td>
                          <td className="border px-4 py-2">
                            {new Date(s.submitted_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExercises;
