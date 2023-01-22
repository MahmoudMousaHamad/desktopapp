import { WorkOutline } from "@mui/icons-material";
import { Avatar, Box, List, ListItem, Sheet, Typography } from "@mui/joy";
import { CircularProgress, ListItemAvatar, ListItemText } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { sendData } from "../actions/socket";

export default () => {
	const { jobs } = useSelector((s) => s.socket);
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(sendData("get-jobs"));
	}, [dispatch]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				alignItems: "center",
			}}
		>
			<Sheet
				sx={{
					p: 5,
					borderRadius: 15,
					width: "-webkit-fill-available",
					height: "fit-content",
					display: "flex",
					justifyContent: "center",
				}}
				color="neutral"
				variant="outlined"
			>
				{!jobs && <CircularProgress />}
				{jobs?.length > 0 && (
					<List sx={{ width: "100%", bgcolor: "background.paper" }} dense>
						{jobs.map(({ title, company, submissionDate }) => (
							<ListItem key={title + company}>
								<ListItemAvatar>
									<Avatar>
										<WorkOutline />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={`${title}, ${company}`}
									secondary={new Date(submissionDate).toLocaleString()}
								/>
							</ListItem>
						))}
					</List>
				)}
				{jobs?.length === 0 && (
					<Typography textColor="text.primary" level="body1">
						No applied jobs to display
					</Typography>
				)}
			</Sheet>
		</Box>
	);
};
