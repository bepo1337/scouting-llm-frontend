import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ScoutingAsPrompt from './components/ScoutingAsPrompt';
import Chat from './components/Chat';

function App() {
  return (
    <div className='flex flex-col gap-y-4 p-4 w-full'>
      <Router>
        <NavBar></NavBar>
        <div className='w-1/2 p-4 self-center '>
          <Routes>
            <Route path="/" element={<ScoutingAsPrompt ></ScoutingAsPrompt>} />
            <Route path="/chat" element={<Chat></Chat>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App
