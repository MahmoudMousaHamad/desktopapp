import { CircularProgress, MenuItem, Select } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/joy";

import { sendData } from "../actions/socket";
import { pause, profileFilled, resume, start, stop } from "../BotHelpers";

const { ApplierStatus } = window.electron;

const isDev = process.env.NODE_ENV === "development";

function reducer(state, action) {
	switch (action.type) {
		case ApplierStatus.RUNNING:
			return { running: true };
		case ApplierStatus.STOPPED:
			return null;
		case ApplierStatus.PAUSED:
			return { running: false, paused: true };
		default:
			return null;
	}
}

export default () => {
	const { "bot-status-change": botStatus } = useSelector(
		(state) => state.socket
	);
	const { sessionInProgress, applierState } = useSelector((s) => s.applier);
	const [status, dispatch] = useReducer(reducer, {
		running: botStatus === "start",
	});
	const [loading, setLoading] = useState();
	const [site, setSite] = useState(localStorage.getItem("site") || "INDEED");
	const dispatchRedux = useDispatch();

	const showControl = profileFilled() && !loading;

	useEffect(() => {
		dispatch({ type: applierState });
		setLoading(false);
		if (
			applierState === ApplierStatus.STOPPED ||
			applierState === ApplierStatus.RUNNING
		) {
			dispatchRedux(
				sendData("set-bot-status", {
					source: "desktop",
					status: applierState === ApplierStatus.STOPPED ? "stop" : "start",
				})
			);
		}
	}, [dispatchRedux, applierState]);

	useEffect(() => {
		if (botStatus === "start" && !status?.running) start();
		else if (botStatus === "stop" && status?.running) stop();
	}, [botStatus]);

	if (loading) return <CircularProgress />;

	return (
		<Box>
			{showControl && (
				<>
					{isDev && (
						<Select
							disabled={status?.running || status?.paused}
							onChange={(e) => {
								localStorage.setItem("site", e.target.value);
								setSite(e.target.value);
							}}
							sx={{ mr: 2 }}
							value={site}
						>
							<MenuItem value="INDEED">Indeed</MenuItem>
							<MenuItem value="LINKEDIN">LinkedIn</MenuItem>
						</Select>
					)}
					<Button
						sx={{ mr: 2, p: 5 }}
						size="lg"
						onClick={() => {
							setLoading(true);
							status?.running || status?.paused ? stop() : start();
						}}
						color={status?.running ? "danger" : "success"}
					>
						{(status?.running || status?.paused
							? "stop applying"
							: "start applying"
						).toUpperCase()}
					</Button>
					{isDev && (status?.paused || status?.running) && (
						<Button
							onClick={status?.running ? pause : resume}
							color="danger"
							sx={{ mr: 2 }}
							size="sm"
						>
							{(status?.running ? "Pause" : "Resume").toUpperCase()}
						</Button>
					)}
					{/* <Button
						onClick={() =>
							dispatchRedux(
								sendData("questions", [
									{ text: "What is your email address?", type: "text" },
								])
							)
						}
					>
						Send Question to Phone
					</Button> */}
				</>
			)}
			{!profileFilled() && (
				<Typography textColor="text.warning" level="h4">
					Before starting, please go to your resume and fill out all the
					information there. Also, please fill out your cover letter.
				</Typography>
			)}
		</Box>
	);
};
