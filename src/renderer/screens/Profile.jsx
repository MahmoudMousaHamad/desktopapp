import React from "react";
import { Box, Typography } from "@mui/joy";
import UserInformation from "../components/UserInformation";

import TypeAndExperience from "../components/TypeAndExperience";
import ListTextBox from "../components/ListTextBox";
import Locations from "../components/Locations";

const Profile = () => {
	return (
		<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
			<Box>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
					Common Questions
				</Typography>
				<UserInformation />
			</Box>
			<Box sx={{ p: 3 }}>
				<ListTextBox
					placeholder="Type specific job titles here"
					title="Titles"
					name="titles"
				/>
				<Locations />
				<TypeAndExperience />
			</Box>
		</Box>
	);
};
export default Profile;
