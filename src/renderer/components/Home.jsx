import { useSelector } from "react-redux";

export default () => {
  const { user } = useSelector((state) => state.auth);
  const start = () => {
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
