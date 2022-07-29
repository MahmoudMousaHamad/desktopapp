import React, { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Route, Routes, HashRouter } from "react-router-dom";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import { GlobalStyles } from "@mui/system";
import Typography from "@mui/joy/Typography";
import { deepmerge } from "@mui/utils";

// Icons import
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import MenuIcon from "@mui/icons-material/Menu";

import IconButton from "@mui/joy/IconButton";
import { Work } from "@mui/icons-material";
import { Box } from "@mui/joy";

// custom
import Navigation from "./components/Navigation";
import { joyTheme, muiTheme } from "./theme";
import Layout from "./components/Layout";

// Screens
import Dashboard from "./screens/Dashboard";
import Register from "./screens/Register";
import Profile from "./screens/Profile";
import Login from "./screens/Login";

// Actions
import { endQuestions, setQuestion } from "./actions/qa";
import { updateCount } from "./actions/application";
import CoverLetter from "./screens/CoverLetter";
import { sendData } from "./actions/socket";
import Socket from "./Socket";
import config from "./config";

const ColorSchemeToggle = () => {
	const { mode, setMode } = useColorScheme("dark");
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) {
		return <IconButton size="sm" variant="outlined" color="primary" />;
	}
	return (
		<IconButton
			size="sm"
			variant="outlined"
			color="primary"
			onClick={() => {
				if (mode === "light") {
					setMode("dark");
				} else {
					setMode("light");
				}
			}}
		>
			{mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
		</IconButton>
	);
};

const App = () => {
	const { question } = useSelector((state) => state.qa);
	const auth = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const store = useStore();

	const [drawerOpen, setDrawerOpen] = React.useState(false);

	useEffect(() => {
		window.electron.ipcRenderer.on("question", (data) => {
			dispatch(setQuestion(data.question));
			dispatch(sendData("question", data.question));
		});

		if (auth.isLoggedIn) {
			window.electron.ipcRenderer.on("application-submitted", () => {
				if (!auth.user.id)
					throw Error(
						"User id is not defined, unable to send application update count"
					);
				dispatch(updateCount(auth.user.id));
			});

			if (!Socket.isConnected) {
				Socket.connect(
					config.endpoints(window.electron.NODE_ENV).SERVER_ENDPOINT,
					store
				);
			}
		}

		window.electron.ipcRenderer.on("questions-ended", () => {
			dispatch(endQuestions());
		});

		return () => {
			if (Socket.isConnected) {
				Socket.disconnect();
			}
			window.electron.ipcRenderer.removeAllListeners("question");
			window.electron.ipcRenderer.removeAllListeners("questions-ended");
			window.electron.ipcRenderer.removeAllListeners("application-submitted");
		};
	}, [dispatch, question, auth, store]);

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

			{drawerOpen && (
				<Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
					<Navigation />
				</Layout.SideDrawer>
			)}
			<HashRouter>
				<Layout.Root
					sx={{
						...(drawerOpen && {
							height: "100vh",
							overflow: "hidden",
						}),
					}}
				>
					<Layout.Header>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								gap: 1.5,
							}}
						>
							<IconButton
								variant="outlined"
								size="sm"
								onClick={() => setDrawerOpen(true)}
								sx={{ display: { sm: "none" } }}
							>
								<MenuIcon />
							</IconButton>
							<IconButton
								size="lg"
								variant="solid"
								sx={{ display: { xs: "none", sm: "inline-flex" } }}
							>
								<Work />
							</IconButton>
							<Typography level="h2" fontWeight={700}>
								JobApplier
							</Typography>
							v0.1.5
						</Box>
						<Box sx={{ display: "flex", flexDirection: "row", gap: 1.5 }}>
							<IconButton
								size="sm"
								variant="outlined"
								color="primary"
								sx={{ display: { xs: "inline-flex", sm: "none" } }}
							>
								<SearchRoundedIcon />
							</IconButton>
							<ColorSchemeToggle />
						</Box>
					</Layout.Header>
					<Layout.SideNav>
						<Navigation />
					</Layout.SideNav>
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/coverletter" element={<CoverLetter />} />
					</Routes>
				</Layout.Root>
			</HashRouter>
		</CssVarsProvider>
	);
};

export default App;
