import { useDispatch, useSelector, useStore } from "react-redux";
import { Route, Routes, HashRouter, useNavigate } from "react-router-dom";
import Typography from "@mui/joy/Typography";
import { useEffect, useRef } from "react";

// Icons import
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import IconButton from "@mui/joy/IconButton";
import { ArrowBack, Work } from "@mui/icons-material";
import { Tooltip } from "react-bootstrap";
import { Box } from "@mui/joy";

// Screens
import { stop } from "../BotHelpers";
import Jobs from "../screens/Jobs";
import Filters from "../screens/Filters";
import {
	CLEAR_QUESTIONS,
	JOB_SUBMITTED,
	SET_APPLIER_STATE,
	STOP_SESSION,
} from "../actions/types";
import Session from "../screens/Session";
import Dashboard from "../screens/Dashboard";
import Register from "../screens/Register";
import Resume from "../screens/Resume";
import Pricing from "../screens/Pricing";
import Login from "../screens/Login";

// Actions
import { clearQuestions, endQuestions, setQuestions } from "../actions/qa";
import CoverLetter from "../screens/CoverLetter";
import { sendData } from "../actions/socket";
import Socket from "../Socket";
import config from "../config";

// custom
import ColorSchemeToggle from "./ColorSchemeToggle";
import Navigation from "./Navigation";
import Layout from "./Layout";
import ScrollToTop from "./ScrollToTop";

const { ApplierStatus } = window.electron;

export default () => {
	const { sessionJobCount, sessionInProgress } = useSelector((s) => s.applier);
	const { user } = useSelector((state) => state.socket);
	const auth = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const store = useStore();
	const mainRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (sessionJobCount >= user?.plan?.dailyLimit && sessionInProgress) stop();
	}, [user, sessionJobCount, sessionInProgress]);

	useEffect(() => {
		if (auth.isLoggedIn) {
			window.electron.ipcRenderer.on("questions", (data) => {
				dispatch(setQuestions(data.questions));
				dispatch(sendData("questions", data.questions));
			});
			window.electron.ipcRenderer.on("clear-questions", () => {
				dispatch(clearQuestions());
				dispatch(sendData("clear-questions"));
			});
			window.electron.ipcRenderer.on("application-submitted", () => {
				if (!auth.user.id)
					throw Error(
						"User id is not defined, unable to send application update count"
					);
				dispatch({
					type: JOB_SUBMITTED,
				});
			});

			if (!Socket.isConnected) {
				Socket.connect(
					config.endpoints(window.electron.NODE_ENV).SERVER_ENDPOINT,
					store
				);
			}
			dispatch(sendData("get-user"));
		}
		window.electron.ipcRenderer.on("questions-ended", () =>
			dispatch(endQuestions())
		);
		window.electron.ipcRenderer.on("applier:status", ({ status }) => {
			dispatch({ type: SET_APPLIER_STATE, payload: status });
		});
		window.electron.ipcRenderer.on("session-ended", ({ count, jobs }) => {
			dispatch({ type: STOP_SESSION, payload: ApplierStatus.STOPPED });
			dispatch(
				sendData("session-ended", {
					site: localStorage.site,
					count,
					jobs,
				})
			);
			dispatch({ type: CLEAR_QUESTIONS });
		});

		return () => {
			window.electron.ipcRenderer.removeAllListeners("application-submitted");
			window.electron.ipcRenderer.removeAllListeners("clear-questions");
			window.electron.ipcRenderer.removeAllListeners("questions-ended");
			window.electron.ipcRenderer.removeAllListeners("applier:status");
			window.electron.ipcRenderer.removeAllListeners("session-ended");
			window.electron.ipcRenderer.removeAllListeners("questions");
		};
	}, []);

	return (
		<>
			<ScrollToTop refProp={mainRef} />
			<Layout.Root>
				<Layout.Header>
					<Box
						sx={{
							alignItems: "center",
							flexDirection: "row",
							display: "flex",
							gap: 1.5,
							cursor: "pointer",
						}}
						onClick={() => navigate("/")}
					>
						<IconButton
							size="md"
							variant="solid"
							sx={{ display: { xs: "none", sm: "inline-flex" } }}
						>
							<Work />
						</IconButton>
						<Typography level="h4" fontWeight={700}>
							WORK-SHY
						</Typography>
						<Typography level="body5" paddingTop={3}>
							v1.0.2
						</Typography>
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
				<Layout.Main ref={mainRef}>
					<Tooltip title="Go Back">
						<IconButton
							sx={{ mb: 2 }}
							size="sm"
							variant="soft"
							color="primary"
							onClick={() => navigate(-1)}
						>
							<ArrowBack />
						</IconButton>
					</Tooltip>
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/resume" element={<Resume />} />
						<Route path="/coverletter" element={<CoverLetter />} />
						<Route path="/pricing" element={<Pricing />} />
						<Route path="/session" element={<Session />} />
						<Route path="/filters" element={<Filters />} />
						<Route path="/jobs" element={<Jobs />} />
					</Routes>
				</Layout.Main>
			</Layout.Root>
		</>
	);
};
