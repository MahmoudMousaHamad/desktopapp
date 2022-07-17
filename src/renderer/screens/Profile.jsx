import React from "react";
import { Box, Typography } from "@mui/joy";
import UserInformation from "../components/UserInformation";

import JobTitles from "../components/JobTitles";
import Locations from "../components/Locations";
import TypeAndExperience from "../components/TypeAndExperience";

const Profile = () => {
	return (
		<>
			<Box sx={{ p: 3 }}>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
					Job Preferences
				</Typography>
				<JobTitles />
				<Locations />
				<TypeAndExperience />
			</Box>
			<Box sx={{ p: 3 }}>
				<UserInformation />
			</Box>
		</>
	);
};
export default Profile;
