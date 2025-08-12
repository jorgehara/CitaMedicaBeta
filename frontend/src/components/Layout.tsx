import { useState, type ReactNode } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { FaUserDoctor } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const Layout = ({ children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Horarios', icon: <ScheduleIcon />, path: '/horarios' },
    { text: 'Pacientes', icon: <PeopleIcon />, path: '/pacientes' },
    { text: 'Historial', icon: <HistoryIcon />, path: '/historial' },
    // { text: 'QR WhatsApp', icon: <QrCodeIcon />, path: '/qr' },
    // { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  ];

  const drawer = (
    <Box sx={{ 
      bgcolor: 'background.paper', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Avatar sx={{ 
          bgcolor: 'primary.main', 
          width: 60, 
          height: 60,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}>
          <FaUserDoctor size={35} />
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            letterSpacing: 0.5,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Cita Médica
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false); // Cerrar drawer en móvil al seleccionar
            }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'primary.main',
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: 'common.white'
                }
              },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: 'common.white'
                }
              }
            }}
            selected={window.location.pathname === item.path}
          >
            <ListItemIcon sx={{ 
              color: 'primary.main',
              minWidth: { xs: 40, sm: 45 }
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Dr. Daniel Kulinka
            </Typography>
          </Box>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          width: '90%',
          maxWidth: '1400px',
          margin: '64px auto 0 auto',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0a1929' : '#f5f5f5',
          transition: 'all 0.3s ease-in-out',
          padding: { xs: 2, sm: 3 },
          overflow: 'auto',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
