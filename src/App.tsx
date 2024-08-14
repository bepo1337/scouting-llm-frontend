import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ScoutingAsPrompt from './components/ScoutingAsPrompt';
import Chat from './components/Chat';
import SouthAmericaMap from './components/Map';
import Graph from './components/Graph';
import ComparePlayers from './components/ComparePlayers';

function App() {
  return (
    <div className='flex flex-col gap-y-4 p-4 w-full'>
      <Router>
        <NavBar></NavBar>
        <div className='p-4 self-center w-full flex justify-center'>
          <Routes>
            <Route path="/" element={<ScoutingAsPrompt ></ScoutingAsPrompt>} />
            <Route path="/compare" element={<ComparePlayers ></ComparePlayers>} />
            <Route path="/chat" element={<Chat></Chat>} />
            <Route path="/map" element={<SouthAmericaMap></SouthAmericaMap>} />
            <Route path="/graph" element={<Graph></Graph>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App
