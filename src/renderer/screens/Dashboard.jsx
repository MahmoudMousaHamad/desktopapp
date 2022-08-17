/* eslint-disable promise/always-return */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { Box, useColorScheme } from "@mui/joy";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

import "react-circular-progressbar/dist/styles.css";

import OnboardingModal from "../components/OnboardingModal";
import { sendData } from "../actions/socket";
import Layout from "../components/Layout";
import { stop } from "../BotHelpers";
import QA from "../components/QA";

export default () => {
	const { "bot-status-change": botStatus, "application-counts": counts } =
		useSelector((state) => state.socket);
	const { mode } = useColorScheme("dark");
	const auth = useSelector((state) => state.auth);
	const dispatchRedux = useDispatch();

	useEffect(() => {
		if (!auth.isLoggedIn) return;
		dispatchRedux(sendData("get-application-counts"));
	}, [dispatchRedux, auth]);

	useEffect(() => {
		if (counts?.count >= counts?.limit && botStatus === "start") {
			stop();
		}
	}, [counts, botStatus]);

	if (!auth.isLoggedIn) {
		return <Navigate to="/login" />;
	}

	if (!counts) {
		return (
			<Box
				sx={{
					justifyContent: "center",
					flexDirection: "column",
					alignItems: "center",
					display: "flex",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			{localStorage.getItem("onboard-done") !== "true" && <OnboardingModal />}
			<Layout.SidePane>
				<Box
					sx={{
						justifyContent: "center",
						flexDirection: "column",
						alignItems: "center",
						display: "flex",
					}}
				>
					<Box>
						{counts && (
							<Box sx={{ width: "200px", mt: "50px" }}>
								<CircularProgressbar
									text={`${counts.count} / ${counts.limit}`}
									strokeWidth={5}
									styles={buildStyles({
										trailColor: mode === "dark" ? "white" : "lightgrey",
										textColor: mode === "dark" ? "white" : "black",
										strokeLinecap: "butt",
										pathColor: "#1e88e5",
										textSize: "12px",
									})}
									maxValue={counts.limit}
									value={counts.count}
								/>
							</Box>
						)}
					</Box>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
					<QA />
				</Box>
			</Layout.SidePane>
		</>
	);
};
