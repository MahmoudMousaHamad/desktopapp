import React from "react";
import { Box, Typography } from "@mui/joy";
import UserInformation from "../components/UserInformation";

import TypeAndExperience from "../components/TypeAndExperience";
import JobTitles from "../components/JobTitles";
import Locations from "../components/Locations";

const Profile = () => {
	return (
		<Box sx={{ display: "grid", "grid-template-columns": "1fr 1fr" }}>
			<Box sx={{ p: 3 }}>
				<UserInformation />
			</Box>
			<Box sx={{ p: 3 }}>
				<JobTitles />
				<Locations />
				<TypeAndExperience />
			</Box>
		</Box>
	);
};
export default Profile;
