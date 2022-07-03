/* eslint-disable promise/always-return */
import { Box, Button, Input, Typography } from "@mui/joy";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessage } from "../actions/message";

import { register } from "../actions/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(register(email, password))
        .then(() => {
          setMessage("Registration was successfull");
        })
        .catch(() => {
          setMessage("Something went wrong while registering user.");
        });
    }
  };
  return (
    <Box sx={{ p: 5 }}>
      <form onSubmit={handleRegister}>
        <>
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
          <Button type="submit">Register</Button>
        </>
      </form>
    </Box>
  );
};
export default Register;
