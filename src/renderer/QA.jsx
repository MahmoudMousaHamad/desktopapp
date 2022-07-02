/* eslint-disable react/jsx-no-bind */
import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { questionAnswered } from "./actions/qa";

import "./App.css";
import "./Form.css";
import Question from "./Question";

export default function QA() {
  const { question, answered } = useSelector((state) => state.qa);
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

  console.log("Answer: ", answer);

  return (
    <div className="App">
      {question ? (
        <>
          <Question
            question={question}
            handleChange={handleChange}
            answer={answer}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          {answered ? (
            <h4>Waiting for the next question.</h4>
          ) : (
            <h4>If a question needs your answer, it will show up here.</h4>
          )}
        </>
      )}
    </div>
  );
}
