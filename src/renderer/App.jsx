import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Link, Routes, HashRouter } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";

import "./App.css";
import { CssBaseline } from "@mui/material";
import { Sheet } from "@mui/joy";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Home from "./components/Home";
import QA from "./QA";

import { logout } from "./actions/auth";
import { endQuestions, setQuestion } from "./actions/qa";
import { sendData } from "./actions/socket";

const App = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);
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
    <CssVarsProvider>
      <CssBaseline />
      <HashRouter>
        <Sheet
          sx={{
            marginBottom: 2,
            display: "flex",
            justifyContent: "space-evenly",
            width: 500,
          }}
        >
          {isLoggedIn ? (
            <>
              <Button variant="solid">
                <Link to="/">Dashboard</Link>
              </Button>
              <Button variant="solid">
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="solid">
                <Link to="/qa">Question</Link>
              </Button>
              <Button variant="solid">
                <a href="/login" onClick={logOut}>
                  Log out
                </a>
              </Button>
            </>
          ) : (
            <>
              <Button variant="solid">
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="outlined">
                <Link to="/register" style={{ color: "green" }}>
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </Sheet>
        <Sheet
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            padding: 5,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/qa" element={<QA />} />
          </Routes>
        </Sheet>
      </HashRouter>
    </CssVarsProvider>
  );
};

export default App;
