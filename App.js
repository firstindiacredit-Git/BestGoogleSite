import React from "react";
import Newsapp from "./Components/Newsapp/Newsapp";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfessionCheckWrapper from "./src/components/ProfessionCheckWrapper";
import ProfessionalSelection from "./src/components/ProfessionalSelection";
import SearchPage from "./src/components/SearchPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/professional-selection" element={<ProfessionalSelection />} />
        <Route
          path="/*"
          element={
            <ProfessionCheckWrapper>
              <Routes>
                <Route path="/search" element={<SearchPage />} />
                {/* Add other protected routes here */}
              </Routes>
            </ProfessionCheckWrapper>
          }
        />
        {/* Add public routes like /signin, /signup here if needed */}
      </Routes>
    </Router>
  );
};

export default App;
