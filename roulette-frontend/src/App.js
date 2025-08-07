import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SetupScreen from './SetupScreen';
import RouletteScreen from './RouletteScreen';
// import logo from './logo.svg';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupScreen />} />
        <Route path="/roulette" element={<RouletteScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
