import { useDispatch, useSelector } from "react-redux";
import { CssVarsProvider } from "@mui/joy/styles";
import { Box, Typography } from "@mui/joy";
import { GlobalStyles } from "@mui/system";
import { deepmerge } from "@mui/utils";
import { useEffect } from "react";
import axios from "axios";

import { LOGIN_SUCCESS } from "./actions/types";
import { joyTheme, muiTheme } from "./theme";
import Router from "./components/Router";
import { SERVER_URL } from "./config";
import { stop } from "./BotHelpers";

const App = () => {
	const { "server-error": serverError } = useSelector((state) => state.socket);
	const dispatch = useDispatch();
	useEffect(() => {
		async function getGoogleUserInfo(accessToken) {
			const userInfo = await axios
				.get("https://www.googleapis.com/oauth2/v3/userinfo", {
					headers: { Authorization: `Bearer ${accessToken}` },
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
		if (sessionStorage.tokens) {
			const t = JSON.parse(sessionStorage.tokens);
			if (t.accessToken && Date.now() < t.expiry_date)
				getGoogleUserInfo(t.accessToken);
		}
		window.electron.ipcRenderer.on("google-oauth-tokens", async (tokens) => {
			sessionStorage.tokens = JSON.stringify(tokens);
			const userInfo = await getGoogleUserInfo(tokens.access_token);
			const user = await getUser(userInfo);
			// eslint-disable-next-line no-underscore-dangle
			user.id = user._id;
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
			) : (
				<Router />
			)}
		</CssVarsProvider>
	);
};

export default App;
