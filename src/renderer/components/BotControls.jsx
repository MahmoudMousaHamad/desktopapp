import { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { sendData } from "../actions/socket";

import { pause, profileFilled, resume, start, stop } from "../BotHelpers";

const { DriverStatus } = window.electron;

function reducer(state, action) {
	switch (action.type) {
		case DriverStatus.RUNNING:
			return { running: true };
		case DriverStatus.STOPPED:
			return null;
		case DriverStatus.PAUSED:
			return { running: false, paused: true };
		default:
			throw new Error();
	}
}

export default () => {
	const { "bot-status-change": botStatus, "application-counts": counts } =
		useSelector((state) => state.socket);
	const [status, dispatch] = useReducer(reducer, {
		running: botStatus === "start",
	});
	const [loading, setLoading] = useState();
	const dispatchRedux = useDispatch();

	const canSubmit = counts?.count < counts?.limit;
	const showControl = profileFilled() && canSubmit && !loading;

	useEffect(() => {
		window.electron.ipcRenderer.on("scraper:status", (state) => {
			if (state) {
				dispatch({ type: state });
				setLoading(false);
				console.log("State:", state);
				if (state === DriverStatus.STOPPED || state === DriverStatus.RUNNING) {
					dispatchRedux(
						sendData("set-bot-status", {
							source: "desktop",
							status: state === DriverStatus.STOPPED ? "stop" : "start",
						})
					);
				}
			}
		});

		window.electron.ipcRenderer.send("scraper:status");

		return () => {
			window.electron.ipcRenderer.removeAllListeners("scraper:status");
		};
	}, [dispatchRedux]);

	useEffect(() => {
		if (botStatus === "start" && !status?.running) {
			start();
		} else if (botStatus === "stop" && status?.running) {
			stop();
		}
	}, [botStatus]);

	if (!counts) return <CircularProgress />;

	return (
		<Box>
			{loading && <CircularProgress />}
			{showControl && (
				<>
					<Button
						sx={{ mr: 2 }}
						size="lg"
						onClick={() => {
							setLoading(true);
							status?.running || status?.paused ? stop() : start();
						}}
						color="primary"
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
				<Typography level="body2">
					We thank you for using JobApplier! Unfotunately, you have reached your
					limit. Please pay the fee ($99 for 500 submissions) to keep using
					JobApplier. You can venmo $99 to @mahmoud-mousahamad. Please include
					your JobApplier account email and your full name in the payment note.
					Thank you!
				</Typography>
			)}
			{!profileFilled() && (
				<Typography textColor="text.warning" level="h4">
					Before starting, please go to your profile and fill out all the
					information there. Also, please fill out your cover letter.
				</Typography>
			)}
		</Box>
	);
};
