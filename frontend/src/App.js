import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./containers/Home";
import UserProvider from "./contexts/UserContext";
import ErrorBoundary from "./errorBoundary";

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
