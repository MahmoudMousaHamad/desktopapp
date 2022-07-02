/* eslint-disable promise/always-return */
import { Box, Button, Input, Typography } from "@mui/joy";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { login } from "../actions/auth";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const onChangeEmail = (e) => {
    setemail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(login(email, password))
        .then(() => {
          console.log("Login successful!");
        })
        .catch(console.log);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ p: 5 }}>
      <form onSubmit={handleLogin}>
        <Typography level="label" textColor="text.secondary">
          Email
        </Typography>
        <Input
          sx={{ mb: 1 }}
          type="text"
          value={email}
          onChange={onChangeEmail}
        />

        <Typography level="label" textColor="text.secondary">
          Password
        </Typography>
        <Input
          sx={{ mb: 1 }}
          type="password"
          value={password}
          onChange={onChangePassword}
        />
        <Button type="submit">Login</Button>
      </form>
    </Box>
  );
};
export default Login;
