import { useDispatch, useSelector } from "react-redux";

import { sendData } from "../actions/socket";

export default () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const start = () => {
    window.electron.ipcRenderer.send("start-scraper");
  };

  const stop = () => {
    window.electron.ipcRenderer.send("stop-scraper");
  };

  const sendQuestion = () => {
    dispatch(
      sendData("question", {
        text: "Test Question",
        type: "text",
        options: "None",
      })
    );
  };

  return (
    <>
      {user && (
        <>
          <button type="button" onClick={start}>
            Start
          </button>
          <button type="button" onClick={stop}>
            Stop
          </button>
          {/* <button type="button" onClick={sendQuestion}>
            Send Question
          </button> */}
        </>
      )}
    </>
  );
};
