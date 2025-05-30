import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  List,
  ListItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Fade,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Replace this with your ngrok URL (no trailing slash)
const API_URL = 'https://dd1f-105-157-77-55.ngrok-free.app';

interface TournamentRegistrationProps {
  tournamentId: number;
  teamId?: number;
  onRegistrationComplete?: () => void;
}

interface RegistrationRequest {
  id: number;
  team: {
    id: number;
    name: string;
  };
  status: string;
  rejectionMessage?: string;
}

interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

const TournamentRegistration: React.FC<TournamentRegistrationProps> = ({
  tournamentId,
  teamId,
  onRegistrationComplete,
}) => {
  const { user } = useAuth();
  const isAdmin = (user as User | null)?.role === 'ADMIN';
  const [view, setView] = useState<'admin' | 'team'>(isAdmin ? 'admin' : 'team');
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === 'admin') {
      fetchRegistrationRequests();
    } else if (teamId) {
      fetchTeamRegistration();
    }
    // eslint-disable-next-line
  }, [view, tournamentId, teamId]);

  const fetchRegistrationRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/registration-requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch registration requests:', error);
    }
    setLoading(false);
  };

  const fetchTeamRegistration = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/teams/${teamId}/tournament-registrations`);
      if (response.ok) {
        const data = await response.json();
        const registration = data.find((r: any) => r.tournament.id === tournamentId);
        if (registration) {
          setIsRegistered(true);
          setRegistrationStatus(registration.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch team registration:', error);
    }
    setLoading(false);
  };

  const registerForTournament = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tournaments/${tournamentId}/register-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team: { id: teamId } }),
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Registration failed:', error);
        setLoading(false);
        return;
      }
      setIsRegistered(true);
      setRegistrationStatus('PENDING');
      onRegistrationComplete?.();
    } catch (error) {
      console.error('Failed to register for tournament:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (requestId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/registration-requests/${requestId}/approve`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const error = await response.text();
        console.error('Approval failed:', error);
        setLoading(false);
        return;
      }
      fetchRegistrationRequests();
    } catch (error) {
      console.error('Failed to approve registration:', error);
    }
    setLoading(false);
  };

  const handleReject = async (requestId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/tournaments/${tournamentId}/registration-requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: rejectionMessage }),
        }
      );
      if (!response.ok) {
        const error = await response.text();
        console.error('Rejection failed:', error);
        setLoading(false);
        return;
      }
      setRejectionMessage('');
      fetchRegistrationRequests();
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
    setLoading(false);
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

  const renderTeamView = () => (
    <Fade in={view === 'team'}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom color="primary.main">
          Team Registration
        </Typography>
        <Divider sx={{ width: '100%', mb: 3 }} />
        {!isRegistered ? (
          <Button
            variant="contained"
            color="primary"
            onClick={registerForTournament}
            fullWidth
            size="large"
            sx={{
              fontWeight: 600,
              boxShadow: 2,
              transition: '0.2s',
              ':hover': { backgroundColor: 'primary.dark', transform: 'scale(1.03)' },
              mb: 2,
            }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register for Tournament'}
          </Button>
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', width: '100%', maxWidth: 350 }}>
            <Typography variant="h6" gutterBottom>
              Registration Status
            </Typography>
            <Chip
              label={registrationStatus}
              color={getStatusColor(registrationStatus || '')}
              sx={{ mt: 1, fontWeight: 600, fontSize: 16 }}
            />
          </Paper>
        )}
      </Box>
    </Fade>
  );

  const renderAdminView = () => (
    <Fade in={view === 'admin'}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom color="secondary.main">
          Admin Registration Management
        </Typography>
        <Divider sx={{ width: '100%', mb: 3 }} />
        <List sx={{ width: '100%', maxWidth: 500 }}>
          {requests.length === 0 && (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
              No registration requests yet.
            </Typography>
          )}
          {requests.map((request) => (
            <ListItem key={request.id} sx={{ mb: 2, p: 0 }} disableGutters>
              <Paper elevation={2} sx={{ p: 2, width: '100%', borderLeft: 4, borderColor: getStatusColor(request.status) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {request.team.name}
                  </Typography>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                    sx={{ fontWeight: 600, fontSize: 15 }}
                  />
                </Box>
                {request.status === 'PENDING' && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(request.id)}
                      sx={{ fontWeight: 600, mb: 1, ':hover': { backgroundColor: 'success.dark', transform: 'scale(1.03)' } }}
                      disabled={loading}
                    >
                      {loading ? 'Approving...' : 'Approve'}
                    </Button>
                    <TextField
                      fullWidth
                      label="Rejection reason"
                      value={rejectionMessage}
                      onChange={(e) => setRejectionMessage(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(request.id)}
                      sx={{ fontWeight: 600, ':hover': { backgroundColor: 'error.dark', transform: 'scale(1.03)' } }}
                      disabled={loading}
                    >
                      {loading ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </Box>
                )}
                {request.rejectionMessage && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    Rejection reason: {request.rejectionMessage}
                  </Typography>
                )}
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 520, mx: 2, borderRadius: 5, p: 0, overflow: 'hidden', boxShadow: 8 }}>
        <Box sx={{ bgcolor: 'grey.100', p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            sx={{ mb: 1, width: '100%' }}
            fullWidth
          >
            <ToggleButton value="team" sx={{ fontWeight: 700, fontSize: 16, py: 1.5 }}>Team Registration</ToggleButton>
            <ToggleButton value="admin" sx={{ fontWeight: 700, fontSize: 16, py: 1.5 }}>Admin Management</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ p: 0, minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {view === 'admin' ? renderAdminView() : renderTeamView()}
        </Box>
      </Paper>
    </Box>
  );
};

export default TournamentRegistration; 