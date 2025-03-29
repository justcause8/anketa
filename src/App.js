import "./components/header/header.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreaturePage from "./components/pages/create";
import Header from './components/header/Header';
import Navbar from "./components/nav/Navbar";
import Footer from "./components/footer/Footer";
import LinkQuestionnairePage from "./components/pages/Linkk";
import AnswersPage from "./components/pages/Answers";
import AccountPage from "./components/pages/Account";
import AccountEditPage from "./components/pages/AccountEdit";
import { AuthProvider } from './components/apiContent/AuthContext';

import EditSurveyPage from "./components/pages/EditSurveyPage"; // Импортируем новый компонент

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Navbar />

          <Routes>
            <Route path="/Header" element={<Header />} />
            <Route path="/create" element={<CreaturePage />} />
            <Route path="/Linkk" element={<LinkQuestionnairePage />} />
            <Route path="/Answers" element={<AnswersPage />} />
            <Route path="/Account" element={<AccountPage />} />
            <Route path="/AccountEdit" element={<AccountEditPage />} />            
            <Route path="/edit-survey/:id" element={<EditSurveyPage />} />
          </Routes>

          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;