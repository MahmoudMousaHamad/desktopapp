import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Link, Routes, HashRouter, Navigate } from "react-router-dom";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import { GlobalStyles } from "@mui/system";
import Typography from "@mui/joy/Typography";
import TextField from "@mui/joy/TextField";
import { deepmerge } from "@mui/utils";

// Icons import
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuIcon from "@mui/icons-material/Menu";

// custom
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Box, Sheet } from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import { Work } from "@mui/icons-material";
import { joyTheme, muiTheme } from "./theme";
import Menu from "./components/Menu";
import Layout from "./components/Layout";
import Navigation from "./components/Navigation";

// Screens
import Login from "./screens/Login";
import Register from "./screens/Register";
import Profile from "./screens/Profile";
import QA from "./components/QA";
import Dashboard from "./screens/Dashboard";

// Actions
import { endQuestions, setQuestion } from "./actions/qa";
import { sendData } from "./actions/socket";
import { updateCount } from "./actions/application";
import CoverLetter from "./screens/CoverLetter";

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
		}

		window.electron.ipcRenderer.on("questions-ended", () => {
			dispatch(endQuestions());
		});

		return () => {
			window.electron.ipcRenderer.removeAllListeners("question");
			window.electron.ipcRenderer.removeAllListeners("questions-ended");
			window.electron.ipcRenderer.removeAllListeners("application-submitted");
		};
	}, [dispatch, question, auth]);

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
								JobApplyer
							</Typography>
							v0.1.1
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
