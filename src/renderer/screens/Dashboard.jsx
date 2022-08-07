/* eslint-disable promise/always-return */
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";

import 'react-circular-progressbar/dist/styles.css';

import OnboardingModal from "../components/OnboardingModal";
import { sendData } from "../actions/socket";
import Layout from "../components/Layout";
import QA from "../components/QA";

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

const pause = () => {
	window.electron.ipcRenderer.send("pause-scraper");
};

const resume = () => {
	window.electron.ipcRenderer.send("resume-scraper");
};

const start = () => {
	window.electron.ipcRenderer.send("start-scraper", {
		answers: JSON.parse(localStorage.getItem("user-answers")),
		titles: JSON.parse(localStorage.getItem("titles")),
		locations: JSON.parse(localStorage.getItem("locations")),
		jobType: JSON.parse(localStorage.getItem("job-type")),
		experienceLevel: JSON.parse(localStorage.getItem("experience-level")),
		coverLetter: localStorage.getItem("cover-letter"),
	});
};

const stop = () => {
	window.electron.ipcRenderer.send("stop-scraper");
};

export default () => {
	const { "bot-status-change": botStatus, "application-counts": counts } =
		useSelector((state) => state.socket);
	const [status, dispatch] = useReducer(reducer, {
		running: botStatus === "start",
	});
	const auth = useSelector((state) => state.auth);
	const dispatchRedux = useDispatch();
	const [loading, setLoading] = useState();

	const canSubmit = counts?.count < counts?.limit;
	const showControl = profileFilled() && canSubmit && !loading;

	useEffect(() => {
		window.electron.ipcRenderer.on("scraper-status", (state) => {
			console.log("Scraper status", state);
			if (state) {
				dispatch({ type: state });
				setLoading(false);
			}
		});

		window.electron.ipcRenderer.send("scraper-status");

		return () => {
			window.electron.ipcRenderer.removeAllListeners("scraper-status");
		}
	}, []);

	useEffect(() => {
		if (!auth.isLoggedIn) return;
		dispatchRedux(sendData("get-application-counts"));
	}, [dispatchRedux, auth]);

	useEffect(() => {
		if (botStatus === "start" && !status?.running) {
			start();
		} else if (botStatus === "stop" && status?.running) {
			stop();
		}
	}, [botStatus]);

	useEffect(() => {
		if (counts?.count >= counts?.limit && status?.running) {
			stop();
		}
	}, [counts, status, status?.running]);

	if (!auth.isLoggedIn) {
		return <Navigate to="/login" />;
	}

	if (!counts) {
		return (
			<Box sx={{ display: 'flex', justifyContent: "center", height: "100vh", flexDirection: "column", alignItems: "center" }}>
				<CircularProgress />
			</Box>
		);
	}

	console.log("Status:", status);

	return (
		<>
			{localStorage.getItem("onboard-done") !== "true" && <OnboardingModal />}
			<Layout.SidePane>
				<Box sx={{ display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							alignItems: "center"
						}}>
					<Box sx={{ mt: 10 }}>
						<Box sx={{ p: 2 }}>
							{counts && (
								<Box sx={{ width: "175px" }}>
									<CircularProgressbar
										text={`${counts.count} / ${counts.limit}`}
										strokeWidth={5}
										styles={buildStyles({
											textSize: '12px',
											strokeLinecap: "butt",
											textColor: "white",
											trailColor: "white",
											pathColor: "#1e88e5"
										})}
										maxValue={counts.limit}
										value={counts.count}
									/>
								</Box>
							)}
						</Box>
					</Box>
					<Box sx={{ mb: 20 }}>
						{ loading && <CircularProgress /> }
						{ showControl && (
							<>
								<Button
									sx={{ mr: 2 }}
									size="lg"
									onClick={
										status?.running || status?.paused
											? () => {
												setLoading(true);
												dispatchRedux(
													sendData("set-bot-status", {
														status: "stop",
														source: "desktop",
													})
												);
											}
											: () => {
												setLoading(true);
												dispatchRedux(
													sendData("set-bot-status", {
														status: "start",
														source: "desktop",
													})
												);
											}
									}
									color={
										status?.running || status?.paused ? "danger" : "primary"
									}
								>
									{(status?.running || status?.paused
										? "stop"
										: "start"
									).toUpperCase()}
								</Button>
								{(status?.paused || status?.running) && (
									<Button
										size="lg"
										onClick={status?.running ? pause : resume}
										color="warning"
									>
										{(status?.running ? "Pause" : "Resume").toUpperCase()}
									</Button>
								)}
							</>
						)}
						{!canSubmit && (
							<Typography textColor="" level="body2">
								We thank you for using JobApplier! Unfotunately, you have
								reached your limit. Please pay the fee ($99 for 500 submissions)
								to keep using JobApplier. You can venmo $99 to
								@mahmoud-mousahamad. Please include your JobApplier account
								email and your full name in the payment note. Thank you!
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
		</>
	);
};
