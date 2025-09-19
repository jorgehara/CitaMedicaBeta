import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a237e 0%, #0d47a1 100%)' 
    : 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

const StyledCardContent = styled(CardContent)({
  padding: '24px',
});

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

const DashboardCard = ({ title, children, onClick, clickable }: DashboardCardProps) => {
  return (
    <StyledCard
      onClick={onClick}
      sx={clickable ? { cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } } : {}}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
    >
      <StyledCardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ 
          color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1a237e',
          fontWeight: 600,
          marginBottom: 2
        }}>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
        </StyledCardContent>
    </StyledCard>
  );
};

export default DashboardCard;
