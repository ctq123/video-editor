import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './page/Start';
import ProcessVideo from './page/ProcessVideo';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/process" element={<ProcessVideo />} />
      </Routes>
    </Router>
  )
}

export default App
