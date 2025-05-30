import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  SportsSoccer as TournamentIcon,
  Group as TeamIcon,
  Person as PlayerIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Tournaments',
      icon: <TournamentIcon sx={{ fontSize: 40 }} />,
      path: '/tournaments',
    },
    {
      title: 'Teams',
      icon: <TeamIcon sx={{ fontSize: 40 }} />,
      path: '/teams',
    },
    {
      title: 'Players',
      icon: <PlayerIcon sx={{ fontSize: 40 }} />,
      path: '/players',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tournament System Dashboard
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <Box sx={{ mb: 2 }}>{item.icon}</Box>
              <Typography variant="h6" component="h2">
                {item.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 