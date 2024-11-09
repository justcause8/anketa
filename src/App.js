import "./components/header/header.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/header/Header';
import Navbar from "./components/nav/Navbar";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <div className="App">

      <Router>
        <Navbar />
        <Routes>
          <Route path="/Header" element={<Header />} />

        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;

