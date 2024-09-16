import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './page/Start';
import DetectPage from './page/DetectPage';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/detect" element={<DetectPage />} />
      </Routes>
    </Router>
  )
}

export default App
