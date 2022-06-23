import { useDispatch, useSelector } from "react-redux";
import socketIOClient from "socket.io-client";
import { setSocket } from "../actions/socket";
import config from "../../config";

export default () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const start = () => {
    const socket = socketIOClient(config.SERVER_ENDPOINT);
    socket.emit("user", user);
    dispatch(setSocket(socket));
    window.electron.ipcRenderer.send("start-scraper", user);
  };

  return (
    <>
      {user && (
        <button type="button" onClick={start}>
          Start Applying
        </button>
      )}
    </>
  );
};
