import { Box, Button, Typography } from "@mui/joy";
import { LinearProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BotControls from "../components/BotControls";

export default () => {
	const navigate = useNavigate();
	const { sessionInProgress, sessionJobCount } = useSelector(
		(state) => state.applier
	);

	console.log("Session in progress", sessionInProgress);
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				width: "100%",
				flexDirection: "column",
				justifyItems: "center",
			}}
		>
			<BotControls />
			<Box sx={{ mt: 5, width: "200px" }}>
				{sessionInProgress ? (
					<Box sx={{ width: "100%" }}>
						<Typography level="body1">
							Your {localStorage.site} session is in progress...
						</Typography>
						<LinearProgress />
					</Box>
				) : (
					<>
						<Typography level="body1">
							Your {localStorage.site} session has ended
						</Typography>
						<Typography level="body2">
							You applied to {sessionJobCount} job
							{sessionJobCount > 1 ? "s" : ""}
						</Typography>
						<Button onClick={() => navigate("/")}>GO BACK</Button>
					</>
				)}
			</Box>
		</Box>
	);
};
