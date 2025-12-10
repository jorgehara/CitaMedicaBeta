import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import History from './pages/History';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import BookAppointment from './pages/BookAppointment';
import ProtectedRoute from './components/ProtectedRoute';
import { ColorModeContext } from './context/ColorModeContext';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#2c3e50',
            secondary: mode === 'dark' ? '#b0bec5' : '#7f8c8d',
          },
          background: {
            default: mode === 'dark' ? '#0a1929' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e2f' : '#ffffff',
          },
        },
        components: {
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: mode === 'dark' ? '#ffffff' : '#2c3e50',
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              h6: {
                color: mode === 'dark' ? '#ffffff' : '#2c3e50',
              },
            },
          },
        },
      }),
    [mode]
  );

  // Sincronizar modo oscuro con HTML para Tailwind
  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/agendar-turno" element={<BookAppointment />} />
              <Route path="/reservar-turno" element={<BookAppointment />} />
              <Route path="/book-appointment" element={<BookAppointment />} />

              {/* Rutas protegidas - Requieren autenticación */}
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Box
                        component="main"
                        sx={{
                          flexGrow: 1,
                          p: 3,
                          width: '1200px',
                          maxWidth: '1200px',
                          mx: 'auto',
                          '@media (max-width: 1200px)': {
                            maxWidth: '100%',
                            px: { xs: 2, sm: 3 }
                          }
                        }}
                      >
                        <Dashboard />
                      </Box>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/horarios"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Box
                        component="main"
                        sx={{
                          flexGrow: 1,
                          p: 3,
                          width: '1200px',
                          maxWidth: '1200px',
                          mx: 'auto',
                          '@media (max-width: 1200px)': {
                            maxWidth: '100%',
                            px: { xs: 2, sm: 3 }
                          }
                        }}
                      >
                        <Schedule />
                      </Box>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/historial"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Box
                        component="main"
                        sx={{
                          flexGrow: 1,
                          p: 3,
                          width: '1200px',
                          maxWidth: '1200px',
                          mx: 'auto',
                          '@media (max-width: 1200px)': {
                            maxWidth: '100%',
                            px: { xs: 2, sm: 3 }
                          }
                        }}
                      >
                        <History />
                      </Box>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect cualquier ruta no encontrada a login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}
export default App;
