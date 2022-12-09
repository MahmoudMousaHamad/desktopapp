import { useDispatch, useSelector, useStore } from "react-redux";
import { Route, Routes, HashRouter } from "react-router-dom";
import Typography from "@mui/joy/Typography";
import { useEffect } from "react";

// Icons import
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import IconButton from "@mui/joy/IconButton";
import { Work } from "@mui/icons-material";
import { Box } from "@mui/joy";

// Screens
import Dashboard from "../screens/Dashboard";
import Register from "../screens/Register";
import Profile from "../screens/Profile";
import Login from "../screens/Login";

// Actions
import { endQuestions, setQuestion, setQuestions } from "../actions/qa";
import CoverLetter from "../screens/CoverLetter";
import { sendData } from "../actions/socket";
import Socket from "../Socket";
import config from "../config";

// custom
import ColorSchemeToggle from "./ColorSchemeToggle";
import Navigation from "./Navigation";
import Layout from "./Layout";
import BotControls from "./BotControls";

export default () => {
	const { questions } = useSelector((state) => state.qa);
	const auth = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const store = useStore();

	useEffect(() => {
		window.electron.ipcRenderer.on("question", (data) => {
			dispatch(setQuestion(data.question));
			dispatch(sendData("question", data.question));
		});

		window.electron.ipcRenderer.on("questions", (data) => {
			dispatch(setQuestions(data.questions));
			dispatch(sendData("questions", data.questions));
		});

		if (auth.isLoggedIn) {
			window.electron.ipcRenderer.on("application-submitted", () => {
				if (!auth.user.id)
					throw Error(
						"User id is not defined, unable to send application update count"
					);
				dispatch(sendData("application-submit"));
			});

			if (!Socket.isConnected) {
				Socket.connect(
					config.endpoints(window.electron.NODE_ENV).SERVER_ENDPOINT,
					store
				);
			}
			console.log("Getting application counts");
			dispatch(sendData("get-application-counts"));
		}

		window.electron.ipcRenderer.on("questions-ended", () => {
			dispatch(endQuestions());
		});

		return () => {
			window.electron.ipcRenderer.removeAllListeners("application-submitted");
			window.electron.ipcRenderer.removeAllListeners("questions-ended");
			window.electron.ipcRenderer.removeAllListeners("questions");
			window.electron.ipcRenderer.removeAllListeners("question");
		};
	}, [dispatch, questions, auth, store]);

	return (
		<HashRouter>
			<Layout.Root>
				<Layout.Header>
					<Box
						sx={{
							alignItems: "center",
							flexDirection: "row",
							display: "flex",
							gap: 1.5,
						}}
					>
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
						v0.1.10
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
				<Layout.Main>
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/coverletter" element={<CoverLetter />} />
					</Routes>
				</Layout.Main>
				<Layout.Controls>{auth.isLoggedIn && <BotControls />}</Layout.Controls>
			</Layout.Root>
		</HashRouter>
	);
};
