/* eslint-disable react/jsx-no-bind */
import { Box, Button, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import IconButton from "@mui/joy/IconButton";
import { questionAnswered } from "../actions/qa";
import Question from "./Question";

export default function QA() {
  const { question } = useSelector((state) => state.qa);
  const dispatch = useDispatch();
  const [answer, setAnswer] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setAnswer();
    setError();
  }, [question]);

  function handleSubmit() {
    if (answer) {
      console.log("Sending answer to main...", answer);
      window.electron.ipcRenderer.send("answer", {
        answer,
        question,
      });
      setAnswer(undefined);
      dispatch(questionAnswered());
    } else {
      setError("Please answer the question.");
    }
  }

  function handleChange(value) {
    setAnswer(value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <Box sx={{ margin: "auto", width: "fit-content" }}>
      {question ? (
        <>
          <Box>
            <Question
              question={question}
              handleChange={handleChange}
              answer={answer}
              onKeyDown={handleKeyDown}
            />
          </Box>
          <Box sx={{ paddingRight: 5, marginTop: 5 }}>
            <IconButton
              size="lg"
              variant="solid"
              color="primary"
              onClick={handleSubmit}
              sx={{ borderRadius: "50%" }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          {error && (
            <Typography textColor="red" level="body3">
              If a question needs your attention, it will show up here.
            </Typography>
          )}
        </>
      ) : (
        <Typography textColor="text.tertiary" level="body2">
          If a question needs your attention, it will show up here.
        </Typography>
      )}
    </Box>
  );
}
