
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { PopcardProvider } from './context/PopCardContext.jsx'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

SplashScreen.hide().catch(() => {})
StatusBar.setStyle({ style: Style.Light }).catch(() => {})

createRoot(document.getElementById('root')).render(
 <HashRouter>
 <PopcardProvider>
    <App />
    </PopcardProvider>
</HashRouter>
)
