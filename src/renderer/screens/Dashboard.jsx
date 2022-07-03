import { useSelector } from "react-redux";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Box, Button, Typography } from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import { useState } from "react";

import QA from "../components/QA";
import Layout from "../components/Layout";

export default () => {
  const [startStop, setStartStop] = useState("start");

  const start = () => {
    window.electron.ipcRenderer.send("start-scraper", {
      answers: JSON.parse(localStorage.getItem("user-answers")),
      titles: JSON.parse(localStorage.getItem("titles")),
      locations: JSON.parse(localStorage.getItem("locations")),
      jobType: JSON.parse(localStorage.getItem("job-type")),
      experienceLevel: JSON.parse(localStorage.getItem("experience-level")),
    });
    setStartStop("stop");
  };

  const stop = () => {
    window.electron.ipcRenderer.send("stop-scraper");
    setStartStop("start");
  };

  return (
    <>
      <Layout.SidePane>
        <Box
          sx={{
            p: 2,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            textColor="neutral.500"
            fontWeight={700}
            sx={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: ".1rem",
            }}
          >
            Current Application
          </Typography>
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ "--IconButton-size": "24px" }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <Box sx={{ p: 5, margin: "auto", width: "fit-content" }}>
          <Typography textColor="text.tertiary" level="h3">
            Job Title
          </Typography>
          <Typography textColor="text.tertiary" level="h6">
            Company Name
          </Typography>
          <Typography textColor="text.tertiary" level="body1">
            Location
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            textColor="neutral.500"
            fontWeight={700}
            sx={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: ".1rem",
            }}
          >
            Controls
          </Typography>
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ "--IconButton-size": "24px" }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <Box sx={{ p: 10, textAlign: "center" }}>
          <Button
            size="lg"
            onClick={startStop === "start" ? start : stop}
            color={startStop === "start" ? "primary" : "danger"}
          >
            {startStop.toUpperCase()}
          </Button>
        </Box>
      </Layout.SidePane>
      <Layout.Main sx={{ display: "flex", alignItems: "center" }}>
        <QA />
      </Layout.Main>
    </>
  );
};

// const sendQuestion = () => {
//   dispatch(
//     sendData("question", {
//       text: "Test Question",
//       type: "text",
//       options: "None",
//     })
//   );
// };
