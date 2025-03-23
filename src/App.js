import "./components/header/header.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/header/Header';
import Navbar from "./components/nav/Navbar";
import Footer from "./components/footer/Footer";
import CreaturePage from "./components/pages/create";
import LinkQuestionnairePage from "./components/pages/Linkk";
import AnswersPage from "./components/pages/Answers";
import AccountPage from "./components/pages/Account";
import AccountEditPage from "./components/pages/AccountEdit";


function App() {
  return (
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
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;

