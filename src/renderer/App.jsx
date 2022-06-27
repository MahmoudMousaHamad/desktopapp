import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Link, Routes, HashRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Home from "./components/Home";
import QA from "./QA";

import { logout } from "./actions/auth";
import { endQuestions, setQuestion } from "./actions/qa";
import { sendData } from "./actions/socket";

const App = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { question } = useSelector((state) => state.qa);
  const dispatch = useDispatch();

  const logOut = () => {
    dispatch(logout());
  };

  useEffect(() => {
    window.electron.ipcRenderer.on("question", (data) => {
      dispatch(setQuestion(data.question));
      dispatch(sendData("question", data.question));
    });

    window.electron.ipcRenderer.on("questions-ended", () => {
      dispatch(endQuestions());
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("question");
    };
  }, [dispatch, question]);

  return (
    <HashRouter>
      <div>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
          <div className="navbar-nav  mr-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
          </div>
          {currentUser ? (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/profile" className="nav-link">
                  {currentUser.email}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/qa" className="nav-link">
                  QA
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={logOut}>
                  Log out
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </nav>
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/qa" element={<QA />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
