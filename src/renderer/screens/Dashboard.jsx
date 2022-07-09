/* eslint-disable promise/always-return */
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Box, Button, Typography } from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
import { useEffect, useReducer } from "react";

import QA from "../components/QA";
import Layout from "../components/Layout";
import { sendData } from "renderer/actions/socket";
import { useDispatch } from "react-redux";

const initialState = null;

function reducer(state, action) {
  switch (action.type) {
    case "running":
      return { running: true };
    case "stopped":
      return null;
    case "paused":
      return { running: false, paused: true };
    default:
      throw new Error();
  }
}

export default () => {
  const [status, dispatch] = useReducer(reducer, initialState);
  const dispatchRedux = useDispatch();

  useEffect(() => {
    window.electron.ipcRenderer.on("scraper-status", (state) => {
      state && dispatch({ type: state });
    });

    window.electron.ipcRenderer.send("scraper-status");
  });

  const start = () => {
    window.electron.ipcRenderer.send("start-scraper", {
      answers: JSON.parse(localStorage.getItem("user-answers")),
      titles: JSON.parse(localStorage.getItem("titles")),
      locations: JSON.parse(localStorage.getItem("locations")),
      jobType: JSON.parse(localStorage.getItem("job-type")),
      experienceLevel: JSON.parse(localStorage.getItem("experience-level")),
    });
  };

  const stop = () => {
    window.electron.ipcRenderer.send("stop-scraper");
  };

  const pause = () => {
    window.electron.ipcRenderer.send("pause-scraper");
  };

  const resume = () => {
    window.electron.ipcRenderer.send("resume-scraper");
  };

  const sendQuestion = () => {
    dispatchRedux(
      sendData("question", {
        text: "Test Question",
        type: "text",
        options: "None",
      })
    );
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
            sx={{ mr: 2 }}
            size="lg"
            onClick={status?.running || status?.paused ? stop : start}
            color={status?.running || status?.paused ? "danger" : "primary"}
          >
            {(status?.running || status?.paused
              ? "stop"
              : "start"
            ).toUpperCase()}
          </Button>
          {status && !status?.stopped && (
            <Button
              size="lg"
              onClick={status?.running ? pause : resume}
              color="warning"
            >
              {(status?.running ? "Pause" : "Resume").toUpperCase()}
            </Button>
          )}
          <Box sx={{ m: 2 }}>
            <Button
              size="lg"
              onClick={sendQuestion}
              color="neutral"
            >
              SEND QUESTION TO PHONE
            </Button>
          </Box>
        </Box>
      </Layout.SidePane>
      <Layout.Main sx={{ display: "flex", alignItems: "center" }}>
        <QA />
      </Layout.Main>
    </>
  );
};


