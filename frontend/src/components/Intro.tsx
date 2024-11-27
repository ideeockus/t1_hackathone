import { Box, Button, Typography } from '@mui/material'
import introImg from '../assets/img/intro.jpg'
import { Header } from './Header'

export function Intro() {
  return (
    <Box
      sx={{
        position: 'relative',
        background: `url(${introImg}) center no-repeat`,
        backgroundSize: 'cover',
        height: '560px',
        borderRadius: '40px'
      }}
    >
      <Header />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          translate: '-50% -50%',
          width: '100%'
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '48px',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            mb: '75px'
          }}
        >
          Создайте своего чат-бота с поддержкой искусственного интеллекта
        </Typography>
        <Button
          sx={{
            display: 'block',
            mx: 'auto',
            padding: '25px 130px',
            borderRadius: 50 
          }}
          variant="contained"
        >
          Начать
        </Button>
      </div>
    </Box>
  )
}
