import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './page/Start';
import ProcessVideo from './page/ProcessVideo';
import VideoEditor from './page/VideoEditor';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/process" element={<ProcessVideo />} />
        <Route path="/edit" element={<VideoEditor />} />
      </Routes>
    </Router>
  )
}

export default App
