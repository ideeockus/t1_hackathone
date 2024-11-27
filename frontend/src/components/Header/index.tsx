import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import styles from "./Header.module.scss"


export function Header () {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navLinks = ['Решения', 'Шаблоны', 'Клиенты', 'Цены', 'Ресуры']

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
    };

    const handleMenuClose = () => {
      setAnchorEl(null)
    };

  return (
    <Box sx={{
      position: 'absolute',
      top: '20px',
      right: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 50,
      p: '6px',
      border: '1px solid #fff'
    }}>
        <Box sx={{
          bgcolor: 'white',
          width: '66px',
          height: '30px',
          borderRadius: 50
        }} />
        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <Button sx={{ textTransform: 'capitalize', color: 'white'}} key={link}>
              {link}
            </Button>
          ))}
        </div>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {navLinks.map((link) => (
            <MenuItem key={link} onClick={handleMenuClose}>
              <Button sx={{ textTransform: 'capitalize', color: 'white'}} href={link}>
                {link}
              </Button>
            </MenuItem>
          ))}
        </Menu>
    </Box>
  )
}