import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const professions = [
  { id: "student", name: "Student", icon: "🎓", description: "Currently studying or pursuing education" },
  { id: "teacher", name: "Teacher", icon: "👩‍🏫", description: "Teaching in a school, college, or university" },
  { id: "professional", name: "Professional", icon: "💼", description: "Working in a professional field" },
  { id: "entrepreneur", name: "Entrepreneur", icon: "🚀", description: "Running your own business or startup" },
  { id: "freelancer", name: "Freelancer", icon: "🆓", description: "Working independently on projects" },
  { id: "retired", name: "Retired", icon: "🌅", description: "Retired from active work" },
  { id: "other", name: "Other", icon: "✨", description: "Other profession or occupation" },
];

const ProfessionalSelection = () => {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSelect = (id) => setSelected(id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Please select a profession.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      await updateDoc(doc(db, "users", user.uid), {
        profession: selected,
        professionSelectedAt: new Date(),
      });
      navigate("/profile"); // or navigate("/") for main app
    } catch (err) {
      setError("Failed to save profession. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-center">Select Your Profession</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-6">
          {professions.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`flex items-center gap-3 p-4 border rounded-lg transition-all w-full text-left ${selected === p.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => handleSelect(p.id)}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="font-semibold">{p.name}</span>
              <span className="text-gray-500 text-sm ml-2">{p.description}</span>
            </button>
          ))}
        </div>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default ProfessionalSelection; 