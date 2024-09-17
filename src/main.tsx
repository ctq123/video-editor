// import { StrictMode } from 'react'; // 严格模式开发环境会重复执行两次componentDidMount
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// import Start from './page/Start.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <App />
)
