import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import api from '../api';

const AdminJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectionMessages, setRejectionMessages] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tournaments/registration-requests');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const request = requests.find(req => req.id === id);
      if (!request || !request.tournament) {
        setError('Tournament not found');
        return;
      }
      await api.post(`/tournaments/${request.tournament.id}/registration-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      setError('Failed to approve request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const request = requests.find(req => req.id === id);
      if (!request || !request.tournament) {
        setError('Tournament not found');
        return;
      }
      await api.post(`/tournaments/${request.tournament.id}/registration-requests/${id}/reject`, {
        message: rejectionMessages[id] || '',
      });
      setRejectionMessages((prev) => ({ ...prev, [id]: '' }));
      fetchRequests();
    } catch (err) {
      setError('Failed to reject request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
        Tournament Join Requests
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List sx={{ width: '100%', maxWidth: 700 }}>
          {requests.length === 0 && (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
              No join requests found.
            </Typography>
          )}
          {requests.map((req) => (
            <ListItem key={req.id} sx={{ mb: 2, p: 0 }} disableGutters>
              <Paper elevation={2} sx={{ p: 2, width: '100%', borderLeft: 4, borderColor: getStatusColor(req.status) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {req.team?.name || 'Unknown Team'}
                  </Typography>
                  <Chip
                    label={req.status}
                    color={getStatusColor(req.status)}
                    sx={{ fontWeight: 600, fontSize: 15 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tournament: {req.tournament?.name || 'Unknown Tournament'}
                </Typography>
                {req.status === 'PENDING' && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(req.id)}
                      sx={{ fontWeight: 600, mb: 1, ':hover': { backgroundColor: 'success.dark', transform: 'scale(1.03)' } }}
                      disabled={actionLoading[req.id]}
                    >
                      {actionLoading[req.id] ? 'Approving...' : 'Approve'}
                    </Button>
                    <TextField
                      fullWidth
                      label="Rejection reason"
                      value={rejectionMessages[req.id] || ''}
                      onChange={(e) => setRejectionMessages((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      sx={{ mb: 1 }}
                      disabled={actionLoading[req.id]}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(req.id)}
                      sx={{ fontWeight: 600, ':hover': { backgroundColor: 'error.dark', transform: 'scale(1.03)' } }}
                      disabled={actionLoading[req.id]}
                    >
                      {actionLoading[req.id] ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </Box>
                )}
                {req.rejectionMessage && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    Rejection reason: {req.rejectionMessage}
                  </Typography>
                )}
              </Paper>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminJoinRequests; 