import { useState, useEffect, type ReactNode } from 'react';
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
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { FaUserDoctor } from 'react-icons/fa6';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import CreateAppointmentButton from './CreateAppointmentButton';
import GlobalCreateAppointmentDialog from './GlobalCreateAppointmentDialog';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const Layout = ({ children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGlobalDialog, setOpenGlobalDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();

  // Exponer función global para abrir el diálogo desde cualquier parte
  useEffect(() => {
    window.openCreateAppointmentDialog = () => setOpenGlobalDialog(true);
    return () => {
     window.openCreateAppointmentDialog = undefined as unknown as () => void;
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    setAnchorEl(null);
    navigate('/change-password');
    setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/', disabled: false },
    { text: 'Horarios', icon: <ScheduleIcon />, path: '/horarios', disabled: false },
    // { text: 'Pacientes', icon: <PeopleIcon />, path: '/pacientes', disabled: true },
    { text: 'Historial', icon: <HistoryIcon />, path: '/historial', disabled: false },
    // { text: 'QR WhatsApp', icon: <QrCodeIcon />, path: '/qr', disabled: true },
    // { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion', disabled: true },
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

      {/* User info and logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleMenuOpen}
          sx={{
            borderRadius: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-2px)',
              boxShadow: 1
            }
          }}
        >
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'secondary.main', 
            mr: 1.5,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}>
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap fontWeight="bold">
              {user?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role || 'Rol'}
            </Typography>
          </Box>
          <ArrowDownIcon 
            sx={{ 
              color: 'text.secondary',
              transition: 'transform 0.3s ease',
              transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)'
            }} 
          />
        </ListItemButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          TransitionProps={{
            timeout: 300
          }}
          sx={{
            '& .MuiPaper-root': {
              minWidth: 200,
              mt: -1,
              borderRadius: 2,
              boxShadow: 3,
              overflow: 'hidden',
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: {
                  opacity: 0,
                  transform: 'translateY(10px)'
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }
          }}
        >
          <MenuItem 
            onClick={handleChangePassword}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'warning.light',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  transform: 'scale(1.2)',
                  color: 'warning.dark'
                },
                '& .MuiListItemText-primary': {
                  color: 'warning.dark',
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <ListItemIcon>
              <LockIcon 
                fontSize="small" 
                sx={{ 
                  color: 'warning.main',
                  transition: 'all 0.2s ease'
                }} 
              />
            </ListItemIcon>
            <ListItemText>Cambiar Contraseña</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem 
            onClick={handleLogout}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'error.light',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  transform: 'scale(1.2)',
                  color: 'error.dark'
                },
                '& .MuiListItemText-primary': {
                  color: 'error.dark',
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon 
                fontSize="small" 
                sx={{ 
                  color: 'error.main',
                  transition: 'all 0.2s ease'
                }} 
              />
            </ListItemIcon>
            <ListItemText>Cerrar Sesión</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
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
          boxShadow: 3,
          position: 'relative'
        }}
      >
        {(location.pathname === '/' || location.pathname === '/horarios' || location.pathname === '/historial') && (
          <Box sx={{ position: 'absolute', top: 0, right: 0, mt: '12px', mr: 8, zIndex: 10 }}>
            <CreateAppointmentButton onClick={() => setOpenGlobalDialog(true)} size="small" />
          </Box>
        )}
        <GlobalCreateAppointmentDialog open={openGlobalDialog} onClose={() => setOpenGlobalDialog(false)} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
