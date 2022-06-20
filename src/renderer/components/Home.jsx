import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default () => {
  const { user } = useSelector((state) => state.auth);

  /**
   * Start scraper and send user to main process
   */
  const start = () => {
    window.electron.ipcRenderer.send('start-scraper', user);
  };

  console.log(user);
  return (
    <>
      <h1>Welcome home!</h1>
      {user && <button type='button' onClick={start}>Start Scraper</button>}
    </>
  );
};