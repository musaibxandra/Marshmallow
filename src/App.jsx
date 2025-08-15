import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import { ToastContainer } from "react-toastify";
import Login from "./components/auth/Login";
import Home from "./screens/Home";
import Board from "./screens/Board";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Home/:userId" element={<Home />} />
        <Route path="/Board/:boardId" element={<Board />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
