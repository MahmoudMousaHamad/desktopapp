/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { Button } from "@mui/joy";
import { useState } from "react";

import MyDialog from "../components/Dialog";
import { START_SESSION, STOP_SESSION } from "../actions/types";
import { profileFilled, start, stop } from "../BotHelpers";
import TypeAndExperience from "../components/TypeAndExperience";
import Locations from "../components/Locations";
import ListTextBox from "../components/ListTextBox";

export default () => {
	const { sessionInProgress } = useSelector((s) => s.applier);
	const [open, setOpen] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	return (
		<>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(2, 1fr)",
					gridTemplateRows: "repeat(2, 0.5fr)",
					gridColumnGap: "20px",
					gridRowGap: "20px",
				}}
			>
				<ListTextBox
					placeholder="Type a job title. Press enter/return to insert"
					title="Titles"
					name="titles"
				/>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column-reverse",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{sessionInProgress ? (
						<Button
							color="danger"
							size="lg"
							sx={{ p: 5 }}
							onClick={() => {
								dispatch({
									type: STOP_SESSION,
								});
								stop();
							}}
						>
							STOP APPLYING
						</Button>
					) : (
						<Button
							color="success"
							size="lg"
							sx={{ p: 5 }}
							onClick={() => {
								if (profileFilled()) {
									dispatch({
										type: START_SESSION,
										payload: {
											site: localStorage.site,
										},
									});
									start();
									navigate("/");
								} else {
									setOpen(true);
								}
							}}
						>
							START APPLYING!
						</Button>
					)}
				</Box>
				<TypeAndExperience />
				<Locations />
			</Box>
			<MyDialog
				open={open}
				message="Make sure to fill out the job location, type, title, and experience"
				onClose={() => setOpen(false)}
				title="Filter missing"
			/>
		</>
	);
};
