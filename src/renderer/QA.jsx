import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import "./App.css";
import "./Form.css";
import Question from "./Question";

export default function QA() {
  const [question, setQuestion] = useState();
  const [last, setLast] = useState(false);
  const [answer, setAnswer] = useState();

  useEffect(() => {
    window.electron.ipcRenderer.on("question", (data) => {
      console.log("Data: ", data);
      setQuestion(data.question);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("question");
    };
  }, [question]);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e.target);
    // window.electron.ipcRenderer.send("answer", {
    //   answer: "HELLO",
    //   last,
    // });
  }

  return (
    <div className="App">
      <form className="form-style-1" onSubmit={handleSubmit}>
        {question ? <Question question={question} /> : <p>No question yet</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
