import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import History from './pages/History';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import { ColorModeContext } from './context/ColorModeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="history" element={<History />} />
                  <Route path="schedule" element={<Schedule />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
