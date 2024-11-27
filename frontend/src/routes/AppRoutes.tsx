import { Route, Routes } from 'react-router-dom'
import { EditPage, HomePage, AdminPanelPage } from '../pages'
import { Container } from '@mui/material'
import { CustomizaitonPage } from '../pages/CustomizationPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <Container maxWidth="lg">
          <HomePage />
        </Container>
      } />
      <Route path="/admin_panel" element={<AdminPanelPage />} />
      <Route path="/admin_panel/edit/:id" element={<EditPage />} />
      <Route
        path="/admin_panel/customizaiton"
        element={<CustomizaitonPage />}
      />
    </Routes>
  )
}