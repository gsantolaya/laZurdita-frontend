// import logo from './logo.svg';
import './App.css';
import axios from "axios";
import { AppRouter } from './router/AppRouter';

axios.defaults.baseURL = process.env.LAZURDITA_APP_API_URL || "http://localhost:4050/api"

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
