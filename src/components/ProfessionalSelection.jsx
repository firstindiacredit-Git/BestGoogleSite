import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTheme } from "../context/ThemeContext";

const ProfessionalSelection = () => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const professions = [
    {
      id: "student",
      name: "Student",
      icon: "🎓",
      description: "Currently studying or pursuing education"
    },
    {
      id: "professional",
      name: "Professional",
      icon: "💼",
      description: "Working in a professional field"
    },
    {
      id: "entrepreneur",
      name: "Entrepreneur",
      icon: "🚀",
      description: "Running your own business or startup"
    },
    {
      id: "freelancer",
      name: "Freelancer",
      icon: "🆓",
      description: "Working independently on projects"
    },
    {
      id: "retired",
      name: "Retired",
      icon: "🌅",
      description: "Retired from active work"
    },
    {
      id: "other",
      name: "Other",
      icon: "✨",
      description: "Other profession or occupation"
    }
  ];

  const handleProfessionSelect = async () => {
    if (!selectedProfession) {
      alert("Please select your profession");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          profession: selectedProfession,
          professionSelectedAt: new Date()
        });
        
        // Navigate to the home page
        navigate("/search");
        // Refresh the page after navigation
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating profession:", error);
      alert("Failed to save profession. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to AllMyTab! 👋
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please tell us about your profession to personalize your experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {professions.map((profession) => (
            <button
              key={profession.id}
              onClick={() => setSelectedProfession(profession.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedProfession === profession.id
                  ? `${isDarkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'}`
                  : `${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{profession.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{profession.name}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profession.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleProfessionSelect}
            disabled={!selectedProfession || isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              selectedProfession && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
            }`}
          >
            {isLoading ? "Saving..." : "Continue to Home"}
          </button>
        </div>

        {/* <div className="text-center mt-6">
          <button
            onClick={() => navigate("/search")}
            className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} underline`}
          >
            Skip for now
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ProfessionalSelection; 