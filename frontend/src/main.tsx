import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F75F2'
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>
)
