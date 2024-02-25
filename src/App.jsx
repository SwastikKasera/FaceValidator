import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PersonValidator from "./components/PersonValidator";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home/>} />
        <Route path="/" element={<PersonValidator/>} />
      </Routes>
    </Router>
  );
}

export default App;
