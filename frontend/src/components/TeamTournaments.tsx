import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, Paper, Chip } from '@mui/material';

// Replace this with your ngrok URL (no trailing slash)
const API_URL = 'https://ab47-196-118-210-65.ngrok-free.app';

interface TournamentRegistration {
  id: number;
  tournament: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  status: string;
  rejectionMessage?: string;
}

interface TeamTournamentsProps {
  teamId: number;
}

export const TeamTournaments: React.FC<TeamTournamentsProps> = ({ teamId }) => {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);

  useEffect(() => {
    fetchRegistrations();
  }, [teamId]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams/${teamId}/tournament-registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Failed to fetch tournament registrations:', error);
    }
  };

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Tournament Registrations
      </Typography>
      <List>
        {registrations.map((registration) => (
          <ListItem key={registration.id} sx={{ mb: 2 }}>
            <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {registration.tournament.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(registration.tournament.startDate).toLocaleDateString()} -{' '}
                {new Date(registration.tournament.endDate).toLocaleDateString()}
              </Typography>
              <Chip
                label={registration.status}
                color={getStatusColor(registration.status)}
                sx={{ mb: 1 }}
              />
              {registration.rejectionMessage && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Rejection reason: {registration.rejectionMessage}
                </Typography>
              )}
            </Paper>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 