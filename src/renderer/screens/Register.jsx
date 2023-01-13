/* eslint-disable promise/always-return */
import { Box, Button, Input, Typography } from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useSnackbar } from "notistack";

import { setMessage } from "../actions/message";
import { register } from "../actions/auth";

const Register = () => {
	const { message } = useSelector((state) => state.message);
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [firstName, setFirstName] = useState("");
	const [password, setPassword] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");

	const onChangeFirstName = (e) => setFirstName(e.target.value);
	const onChangePassword = (e) => setPassword(e.target.value);
	const onChangeLastName = (e) => setLastName(e.target.value);
	const onChangeEmail = (e) => setEmail(e.target.value);

	const handleRegister = (e) => {
		e.preventDefault();
		if (email && password && firstName && lastName) {
			dispatch(register(email, password, firstName, lastName))
				.then(() => {
					enqueueSnackbar("Registration was successfull, please login.");
					navigate("/login");
				})
				.catch(() => {
					setMessage("Sorry, something went wrong.");
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
						type="email"
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

					<Typography level="label" textColor="text.secondary">
						First Name
					</Typography>
					<Input
						sx={{ mb: 1 }}
						type="text"
						value={firstName}
						onChange={onChangeFirstName}
					/>

					<Typography level="label" textColor="text.secondary">
						Last Name
					</Typography>
					<Input
						sx={{ mb: 1 }}
						type="text"
						value={lastName}
						onChange={onChangeLastName}
					/>
					<Button type="submit">Register</Button>
				</>
			</form>
		</Box>
	);
};
export default Register;
