import { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Collapse, IconButton } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

interface Tenant {
  name: string;
  subdomain: string;
  url: string;
  color: string;
}

const TENANTS: Tenant[] = [
  {
    name: 'Dr. Kulinka',
    subdomain: 'micitamedica',
    url: 'http://micitamedica.localhost:5173',
    color: '#2196f3'
  },
  {
    name: 'Od. Melina Villalba',
    subdomain: 'od-melinavillalba',
    url: 'http://od-melinavillalba.localhost:5173',
    color: '#9c27b0'
  }
];

const TenantSwitcher = () => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isDev = hostname.includes('localhost') || hostname.includes('.trycloudflare.com');
    setIsDevMode(isDev);

    if (isDev) {
      const isTunnel = hostname.includes('.trycloudflare.com');
      if (isTunnel) {
        // En tunnel: leer tenant desde cookie (el proxy de Vite la lee para inyectar Host header)
        const match = document.cookie.match(/dev-tenant=([^;]+)/);
        const stored = match ? decodeURIComponent(match[1]) : null;
        const detected = TENANTS.find(t => t.subdomain === stored) || TENANTS[0];
        setCurrentTenant(detected);
      } else {
        const detected = TENANTS.find(t => hostname.includes(t.subdomain)) || TENANTS[0];
        setCurrentTenant(detected);
      }
    }
  }, []);

  const handleSwitchTenant = (tenant: Tenant) => {
    const hostname = window.location.hostname;
    const isTunnel = hostname.includes('.trycloudflare.com');

    if (isTunnel) {
      // En tunnel: guardar en cookie y recargar — el proxy de Vite la leerá
      // para inyectar el Host header correcto hacia el backend
      document.cookie = `dev-tenant=${encodeURIComponent(tenant.subdomain)}; path=/; max-age=86400`;
      window.location.reload();
    } else {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = tenant.url + currentPath;
    }
  };

  if (!isDevMode) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 47, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header - Always visible */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: currentTenant?.color || '#2196f3',
          '&:hover': {
            opacity: 0.9
          }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              boxShadow: '0 0 8px #4caf50',
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            DEV MODE
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>

      {/* Expandable content */}
      <Collapse in={isExpanded}>
        <Box sx={{ padding: '16px', minWidth: '280px' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 2,
              fontSize: '0.85rem'
            }}
          >
            Tenant actual: <strong style={{ color: currentTenant?.color }}>{currentTenant?.name}</strong>
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {TENANTS.map((tenant) => {
              const isActive = currentTenant?.subdomain === tenant.subdomain;
              
              return (
                <Button
                  key={tenant.subdomain}
                  variant={isActive ? 'contained' : 'outlined'}
                  onClick={() => handleSwitchTenant(tenant)}
                  disabled={isActive}
                  sx={{
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    backgroundColor: isActive ? tenant.color : 'transparent',
                    borderColor: tenant.color,
                    color: isActive ? 'white' : tenant.color,
                    '&:hover': {
                      backgroundColor: isActive ? tenant.color : `${tenant.color}20`,
                      borderColor: tenant.color,
                    },
                    '&.Mui-disabled': {
                      backgroundColor: tenant.color,
                      color: 'white',
                      opacity: 0.8
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {tenant.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                      {tenant.subdomain}.localhost
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              marginTop: 2,
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              textAlign: 'center'
            }}
          >
            Solo visible en desarrollo
          </Typography>
        </Box>
      </Collapse>

      {/* Pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Paper>
  );
};

export default TenantSwitcher;
