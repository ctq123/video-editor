import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProcessVideo from './page/ProcessVideo';
import VideoEditor from './page/VideoEditor';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProcessVideo />} />
        <Route path="/edit" element={<VideoEditor />} />
      </Routes>
    </Router>
  )
}

export default App
