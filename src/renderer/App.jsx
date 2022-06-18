import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './App.css';
import './Form.css';

function Hello() {
  const [question, setQuestion] = useState('<p>No question yet</p>');
  const [last, setLast] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.on('question', (event) => {
      console.log('Last: ', event.last);
      setLast(event.last);
      setQuestion(event.question);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('question');
    };
  }, [question]);

  function handleSubmit() {
    window.electron.ipcRenderer.send('answer', {
      answer: 'HELLO',
      last,
    });
  }

  return (
    <div className="App">
      <div className="form-style-1">
        <div dangerouslySetInnerHTML={{ __html: question }} />
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
        {last && <p>This is the last question</p>}
      </div>
    </div>
  );
}
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
