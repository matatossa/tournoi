import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import PlayerManagement from './PlayerManagement';

const TeamDashboard = () => {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (user?.teamId) {
      setTeamId(user.teamId);
    } else {
      api.get('/auth/me').then(res => {
        if (res.data.teamId) setTeamId(res.data.teamId);
      });
    }
  }, [user]);

  useEffect(() => {
    if (teamId) {
      fetchAll();
    }
  }, [teamId]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [tournRes, regRes] = await Promise.all([
        api.get('/tournaments'),
        api.get(`/teams/${teamId}/tournament-registrations`),
      ]);
      setTournaments(tournRes.data);
      setRegistrations(regRes.data);
    } catch (err) {
      setError('Failed to load team dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (tournamentId) => {
    setActionLoading((prev) => ({ ...prev, [tournamentId]: true }));
    try {
      await api.post(`/tournaments/${tournamentId}/register-team`, {
        team: { id: teamId },
      });
      fetchAll();
    } catch (err) {
      setError('Failed to request to join tournament');
    } finally {
      setActionLoading((prev) => ({ ...prev, [tournamentId]: false }));
    }
  };

  const getRegistrationStatus = (tournamentId) => {
    const reg = registrations.find(r => r.tournament.id === tournamentId);
    return reg ? reg.status : null;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
        Team Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Tournaments" />
          <Tab label="Player Management" />
        </Tabs>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {activeTab === 0 ? (
        <>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            All Tournaments
          </Typography>
          <List sx={{ width: '100%', maxWidth: 700 }}>
            {tournaments.map((tournament) => {
              const status = getRegistrationStatus(tournament.id);
              return (
                <ListItem key={tournament.id} sx={{ mb: 2, p: 0 }} disableGutters>
                  <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {tournament.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </Typography>
                    {status ? (
                      <Chip label={status} color={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning'} sx={{ fontWeight: 600, fontSize: 15 }} />
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRequestJoin(tournament.id)}
                        disabled={actionLoading[tournament.id]}
                        sx={{ mt: 1 }}
                      >
                        {actionLoading[tournament.id] ? 'Requesting...' : 'Request to Join'}
                      </Button>
                    )}
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : (
        <PlayerManagement teamId={teamId} />
      )}
    </Box>
  );
};

export default TeamDashboard; 