/* eslint-disable react/jsx-no-bind */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./App.css";
import "./Form.css";
import Question from "./Question";

export default function QA() {
  const { question } = useSelector((state) => state.qa);
  const [answer, setAnswer] = useState();

  function handleSubmit() {
    console.log("Sending answer to main...", answer);
    window.electron.ipcRenderer.send("answer", {
      answer,
      question,
    });
    setAnswer(undefined);
  }

  function handleChange(value) {
    setAnswer(value);
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
          />
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </>
      ) : (
        <p>No question yet</p>
      )}
    </div>
  );
}
