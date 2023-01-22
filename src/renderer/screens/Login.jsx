/* eslint-disable promise/always-return */
import { Box, Button, Input, Typography } from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import GoogleButton from "react-google-button";
import { Navigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";

import { CircularProgress } from "@mui/material";
import { CheckCircle, Done } from "@mui/icons-material";
import Logo from "../../../assets/icon.png";

import { login } from "../actions/auth";

/* <form onSubmit={handleLogin}>
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
			</form> */

const Login = () => {
	const { isLoggedIn } = useSelector((state) => state.auth);
	const { message } = useSelector((state) => state.message);
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [doneLogin, setDoneLogin] = useState(false);

	const [password, setPassword] = useState("");
	const [email, setemail] = useState("");

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
					enqueueSnackbar("Login successful!");
				})
				.catch(console.log);
		}
	};

	useEffect(() => {
		window.electron.ipcRenderer.on("login-done", () => {
			setLoading(false);
			setDoneLogin(true);
		});

		return () => window.electron.ipcRenderer.removeAllListeners("login-done");
	}, []);

	if (isLoggedIn) return <Navigate to="/" />;

	return (
		<Box
			sx={{
				p: 5,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
			}}
		>
			<Box
				sx={{
					// backgroundColor: "#dbe6fd",
					display: "flex",
					justifyContent: "center",
					p: 5,
					flexDirection: "column",
					alignItems: "center",
					borderRadius: "10px",
				}}
			>
				<img src={Logo} width="200px" alt="JobApplier Logo" />
				<Box>
					<Typography sx={{ mt: 1 }} level="h2" fontWeight={700}>
						JobApplier
					</Typography>
				</Box>
				<Box sx={{ mt: 10 }}>
					<GoogleButton
						onClick={() => {
							window.electron.ipcRenderer.send("google-oath");
							setLoading(true);
						}}
					/>
				</Box>
				{loading && <CircularProgress sx={{ mt: 3 }} />}
				{doneLogin && <CheckCircle sx={{ mt: 3 }} />}
			</Box>
		</Box>
	);
};
export default Login;
