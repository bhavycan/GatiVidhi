
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { PopcardProvider } from './context/PopCardContext.jsx'

createRoot(document.getElementById('root')).render(
 <BrowserRouter>
 <PopcardProvider>
    <App />
    </PopcardProvider>
</BrowserRouter>
)
