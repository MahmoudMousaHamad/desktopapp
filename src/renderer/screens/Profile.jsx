import React from "react";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/joy";
import UserInformation from "../components/UserInformation";

import JobTitles from "../components/JobTitles";
import Locations from "../components/Locations";

const Profile = () => {
  const user = useSelector((state) => state.auth);

  console.log(user);

  // if (!currentUser) {
  //   return <Redirect to="/login" />;
  // }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
          Job Preferences
        </Typography>
        <JobTitles />
        <Locations />
      </Box>
      <Box sx={{ p: 3 }}>
        <UserInformation />
      </Box>
    </>
  );
};
export default Profile;
