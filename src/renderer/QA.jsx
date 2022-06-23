import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import "./App.css";
import "./Form.css";
import Question from "./Question";

export default function QA() {
  const { question } = useSelector((state) => state.qa);
  const [answer, setAnswer] = useState();

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Sending answer to main", answer);
    window.electron.ipcRenderer.send("answer", {
      answer,
    });
  }

  function handleChange(e) {
    setAnswer(e.target.value);
  }

  return (
    <div className="App">
      <form
        className="form-style-1"
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        {question ? <Question question={question} /> : <p>No question yet</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
