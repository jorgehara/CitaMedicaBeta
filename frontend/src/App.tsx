import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import QRCode from './components/QRCode';
import Settings from './pages/Settings';
import { ColorModeContext } from './context/ColorModeContext';

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
        <Router>
          <Layout>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/qr" element={<QRCode />} />
                <Route path="/configuracion" element={<Settings />} />
              </Routes>
            </Box>
          </Layout>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
