import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchPage from './components/SearchPage';
import NotePage from './components/NotePage';
import Calculator from './components/Calculator';
import Calendar from './components/Calendar';
import Weather from './components/Weather';
import PasswordGenerator from './components/PasswordGenerator';
import TodoList from './components/TodoList';
import Bookmarks from './components/Bookmarks';
import Signup from './components/Signup';
import Login from './components/Login';
import PremiumPage from './components/PremiumPage';
import AdminDashboard from './components/Admin/Dashboard';
import './App.css';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<SearchPage />} />
                <Route path="/notes" element={<NotePage />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/password-generator" element={<PasswordGenerator />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;