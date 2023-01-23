/* eslint-disable no-nested-ternary */
import { useDispatch, useSelector } from "react-redux";
import { CssVarsProvider } from "@mui/joy/styles";
import { Box, Typography } from "@mui/joy";
import { GlobalStyles } from "@mui/system";
import { deepmerge } from "@mui/utils";
import { useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { LOGIN_SUCCESS } from "./actions/types";
import { joyTheme, muiTheme } from "./theme";
import Router from "./components/Router";
import { SERVER_URL } from "./config";
import { stop } from "./BotHelpers";
import Login from "./screens/Login";

const App = () => {
	const {
		"server-error": serverError,
		"payment-successful": paymentSuccessful,
	} = useSelector((state) => state.socket);
	const { isLoggedIn } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigator = useNavigate();

	useEffect(() => {
		if (paymentSuccessful === true) {
			setTimeout(() => {
				window.electron.ipcRenderer.send("focus-window");
				navigator("/");
			}, 5000);
		}
	}, [paymentSuccessful, navigator]);

	useEffect(() => {
		async function getGoogleUserInfo(access_token) {
			const userInfo = await axios
				.get("https://www.googleapis.com/oauth2/v3/userinfo", {
					headers: { Authorization: `Bearer ${access_token}` },
				})
				.then((res) => res.data);

			return userInfo;
		}
		async function getUser(userInfo) {
			const res = await axios.post(`${SERVER_URL}/api/auth/user`, {
				userInfo,
			});
			return res.data.user;
		}
		async function getUserAndLogin(access_token) {
			const userInfo = await getGoogleUserInfo(access_token);
			const user = await getUser(userInfo);
			// eslint-disable-next-line no-underscore-dangle
			user.id = user._id;
			localStorage.user = JSON.stringify(user);
			dispatch({
				type: LOGIN_SUCCESS,
				payload: { user, ...userInfo },
			});
		}
		if (localStorage.tokens) {
			const t = JSON.parse(localStorage.tokens);
			if (Date.now() < t.expiry_date) getUserAndLogin(t.access_token);
		}
		window.electron.ipcRenderer.on("google-oauth-tokens", async (tokens) => {
			localStorage.tokens = JSON.stringify(tokens);
			const userInfo = await getGoogleUserInfo(tokens.access_token);
			const user = await getUser(userInfo);
			// eslint-disable-next-line no-underscore-dangle
			user.id = user._id;
			localStorage.user = JSON.stringify(user);
			dispatch({
				type: LOGIN_SUCCESS,
				payload: { user, ...userInfo },
			});
		});

		return () =>
			window.electron.ipcRenderer.removeAllListeners("google-oauth-tokens");
	}, [dispatch]);
	if (serverError) stop();
	return (
		<CssVarsProvider
			disableTransitionOnChange
			theme={deepmerge(muiTheme, joyTheme)}
		>
			<GlobalStyles
				styles={(_theme) => ({
					body: {
						margin: 0,
						fontFamily: _theme.vars.fontFamily.body,
					},
				})}
			/>
			{serverError ? (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						flexDirection: "column",
					}}
				>
					<Typography sx={{ textAlign: "center" }}>
						Sorry, something went wrong on our end :(
					</Typography>
				</Box>
			) : isLoggedIn ? (
				<Router />
			) : (
				<Login />
			)}
		</CssVarsProvider>
	);
};

export default App;
