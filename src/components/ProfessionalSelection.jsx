import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTheme } from "../context/ThemeContext";

const ProfessionalSelection = () => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const professions = [
    { id: "student", name: "Student", icon: "🎓", description: "" },
    { id: "software_developer", name: "Software Developer", icon: "💻", description: "" },
    { id: "digital_marketer", name: "Digital Marketer", icon: "📈", description: "" },
    { id: "content_creator", name: "Content Creator / YouTuber", icon: "🎥", description: "" },
    { id: "graphic_designer", name: "Graphic Designer", icon: "🎨", description: "" },
    { id: "entrepreneur", name: "Entrepreneur / Founder", icon: "🚀", description: "" },
    { id: "freelancer", name: "Freelancer", icon: "🆓", description: "" },
    { id: "investor", name: "Investor / Trader", icon: "💰", description: "" },
    { id: "finance_agent", name: "Finance / DSA Agents", icon: "🏦", description: "" },
    { id: "teacher", name: "Teachers / Trainers", icon: "👩‍🏫", description: "" },
    { id: "job_seeker", name: "Job Seekers", icon: "🧑‍💼", description: "" },
    { id: "hr", name: "HR / Recruiter", icon: "🕵️‍♂️", description: "" },
    { id: "travel_enthusiast", name: "Travel Enthusiast", icon: "✈️", description: "" },
  ];

  const interestsList = [
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "sports", name: "Sports", icon: "🏀" },
    { id: "finance", name: "Finance", icon: "💰" },
    { id: "health", name: "Health", icon: "🏥" },
    { id: "music", name: "Music", icon: "🎵" },
    { id: "travel", name: "Travel", icon: "✈️" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "news", name: "News", icon: "📰" },
    { id: "food", name: "Food", icon: "🍔" },
    { id: "other", name: "Other", icon: "✨" },
  ];

  const handleInterestToggle = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleProfessionSelect = async () => {
    if (!selectedProfession) {
      alert("Please select your profession");
      return;
    }
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest");
      return;
    }
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          profession: selectedProfession,
          interests: selectedInterests,
          professionSelectedAt: new Date(),
        });
        setTimeout(() => {
          navigate("/search");
        }, 300);
      }
    } catch (error) {
      console.error("Error updating profession/interests:", error);
      alert("Failed to save profession/interests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Best Google Site! 👋
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please tell us about your profession and interests to personalize your experience
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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Select your interests</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestsList.map((interest) => (
              <button
                type="button"
                key={interest.id}
                onClick={() => handleInterestToggle(interest.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedInterests.includes(interest.id)
                    ? `${isDarkMode ? 'border-blue-400 bg-blue-500/10' : 'border-blue-500 bg-blue-50'}`
                    : `${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                }`}
              >
                <span className="text-xl">{interest.icon}</span>
                <span>{interest.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleProfessionSelect}
            disabled={!selectedProfession || selectedInterests.length === 0 || isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              selectedProfession && selectedInterests.length > 0 && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
            }`}
          >
            {isLoading ? "Saving..." : "Continue to Home"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSelection; 