/* eslint-disable promise/always-return */
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Box, Button, Typography } from "@mui/joy";
import { useEffect, useReducer } from "react";
import IconButton from "@mui/joy/IconButton";

import { Navigate } from "react-router-dom";
import { getCounts } from "../actions/application";
import { sendData } from "../actions/socket";
import Layout from "../components/Layout";
import QA from "../components/QA";
import Socket from "../Socket";
import config from "../config";

const initialState = null;

function reducer(state, action) {
	switch (action.type) {
		case "running":
			return { running: true };
		case "stopped":
			return null;
		case "paused":
			return { running: false, paused: true };
		default:
			throw new Error();
	}
}

function profileFilled() {
	const titles = JSON.parse(localStorage.getItem("titles"));
	const locations = JSON.parse(localStorage.getItem("locations"));
	const type = JSON.parse(localStorage.getItem("job-type"));
	const experience = JSON.parse(localStorage.getItem("experience-level"));

	return titles?.length > 0 && locations?.length > 0 && type && experience;
}

export default () => {
	const [status, dispatch] = useReducer(reducer, initialState);
	const { count, countLimit, canSubmit } = useSelector(
		(state) => state.application
	);
	const auth = useSelector((state) => state.auth);
	const dispatchRedux = useDispatch();
	const store = useStore();

	const start = () => {
		window.electron.ipcRenderer.send("start-scraper", {
			answers: JSON.parse(localStorage.getItem("user-answers")),
			titles: JSON.parse(localStorage.getItem("titles")),
			locations: JSON.parse(localStorage.getItem("locations")),
			jobType: JSON.parse(localStorage.getItem("job-type")),
			experienceLevel: JSON.parse(localStorage.getItem("experience-level")),
			coverLetter: localStorage.getItem("cover-letter"),
		});
		Socket.connect(
			config.endpoints(window.electron.NODE_ENV).SERVER_ENDPOINT,
			store
		);
	};

	const pause = () => {
		window.electron.ipcRenderer.send("pause-scraper");
	};

	const resume = () => {
		window.electron.ipcRenderer.send("resume-scraper");
	};

	const stop = () => {
		window.electron.ipcRenderer.send("stop-scraper");
		Socket.disconnect();
	};

	useEffect(() => {
		if (!auth.isLoggedIn) return;

		window.electron.ipcRenderer.on("scraper-status", (state) => {
			if (state) dispatch({ type: state });
		});

		dispatchRedux(getCounts(auth.user.id));

		window.electron.ipcRenderer.send("scraper-status");
	}, [dispatchRedux, auth]);

	useEffect(() => {
		if (!canSubmit && status?.running) {
			stop();
		}
	}, [canSubmit, status]);

	if (!auth.isLoggedIn) {
		return <Navigate to="/login" />;
	}

	const sendQuestion = () => {
		dispatchRedux(
			sendData("question", {
				text: "Test Question",
				type: "checkbox",
				options: ["Test1", "Test2", "Test3"],
			})
		);
	};

	return (
		<Layout.SidePane>
			<Box>
				<Box
					sx={{
						p: 2,
						mb: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography
						textColor="neutral.500"
						fontWeight={700}
						sx={{
							fontSize: "10px",
							textTransform: "uppercase",
							letterSpacing: ".1rem",
						}}
					>
						Current Application
					</Typography>
				</Box>
				<Box sx={{ p: 5, margin: "auto", width: "fit-content" }}>
					<Box sx={{ p: 2 }}>
						<Typography textColor="text.primary" level="body1">
							Applications filled
						</Typography>
						<Typography
							textColor={canSubmit ? "text.primary" : "red"}
							level="h2"
						>
							{`${count} / ${countLimit}`}
						</Typography>
					</Box>
					<Box>
						{/* <Typography textColor="text.tertiary" level="h3">
              Job Title
            </Typography>
            <Typography textColor="text.tertiary" level="h6">
              Company Name
            </Typography>
            <Typography textColor="text.tertiary" level="body1">
              Location
            </Typography> */}
					</Box>
				</Box>
				<Box
					sx={{
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography
						textColor="neutral.500"
						fontWeight={700}
						sx={{
							fontSize: "10px",
							textTransform: "uppercase",
							letterSpacing: ".1rem",
						}}
					>
						Controls
					</Typography>
				</Box>
				<Box sx={{ p: 10, textAlign: "center" }}>
					{profileFilled() && canSubmit && (
						<>
							<Button
								sx={{ mr: 2 }}
								size="lg"
								onClick={status?.running || status?.paused ? stop : start}
								color={status?.running || status?.paused ? "danger" : "primary"}
							>
								{(status?.running || status?.paused
									? "stop"
									: "start"
								).toUpperCase()}
							</Button>
							{status && !status?.stopped && (
								<Button
									size="lg"
									onClick={status?.running ? pause : resume}
									color="warning"
								>
									{(status?.running ? "Pause" : "Resume").toUpperCase()}
								</Button>
							)}
							{/* <Box sx={{ m: 2 }}>
                <Button size="lg" onClick={sendQuestion} color="neutral">
                  SEND QUESTION TO PHONE
                </Button>
              </Box> */}
						</>
					)}
					{!canSubmit && (
						<Typography textColor="" level="body2">
							We thank you for using JobApplier! Unfotunately, you have reached
							your limit. Please pay the fee ($99 for 500 submissions) to keep
							using JobApplier. You can venmo $99 to @mahmoud-mousahamad. Please
							include your JobApplier account email and your full name in the
							payment note. Thank you!
						</Typography>
					)}
					{!profileFilled() && (
						<Typography textColor="text.warning" level="h4">
							Before starting, please go to your profile and fill out all the
							information there. Also, please fill out your cover letter.
						</Typography>
					)}
				</Box>
			</Box>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<QA />
			</Box>
		</Layout.SidePane>
	);
};
