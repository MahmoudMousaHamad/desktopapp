import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Link, Routes, HashRouter } from "react-router-dom";
import socketIOClient from "socket.io-client";

import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
import config from "config";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Home from "./components/Home";
import { logout } from "./actions/auth";
import { setQuestion } from "./actions/qa";
import QA from "./QA";
import { setSocket } from "./actions/socket";

const App = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { question } = useSelector((state) => state.qa);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const logOut = () => {
    dispatch(logout());
  };

  useEffect(() => {
    window.electron.ipcRenderer.on("question", (data) => {
      console.log("Renderer recieved a question from main.");
      dispatch(setQuestion(data.question));

      if (socket) {
        console.log("Sending question to server via socket connection.");
        socket.emit("question", data.question);
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("question");
      socket.close();
    };
  }, [question, dispatch]);

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
