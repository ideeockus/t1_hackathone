import { Intro } from "../components/Intro"
import { Box } from "@mui/material"
import botImg from "../assets/img/bot.jpg"

export function HomePage () {
  return (
    <Box sx={{ pt: 3 }}>
      <Intro />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <img src={botImg} alt="" />
        {/* <ChatWidget /> */}
      </Box>
    </Box>
  )
}