import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';

const PlayerManagement = ({ teamId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, [teamId]);

  const fetchPlayers = async () => {
    try {
      const response = await api.get(`/teams/${teamId}/players`);
      setPlayers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    try {
      await api.post(`/teams/${teamId}/players`, newPlayer);
      setOpenDialog(false);
      setNewPlayer({ name: '', position: '', jerseyNumber: '' });
      fetchPlayers();
    } catch (err) {
      setError('Failed to add player');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await api.delete(`/teams/${teamId}/players/${playerId}`);
      fetchPlayers();
    } catch (err) {
      setError('Failed to delete player');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Player Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add Player
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {players.map((player) => (
          <ListItem
            key={player.id}
            sx={{
              mb: 2,
              p: 0,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {player.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position: {player.position || 'N/A'} | Jersey: {player.jerseyNumber || 'N/A'}
                </Typography>
              </Box>
              <IconButton
                color="error"
                onClick={() => handleDeletePlayer(player.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Player</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Player Name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Position"
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
              fullWidth
            />
            <TextField
              label="Jersey Number"
              value={newPlayer.jerseyNumber}
              onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })}
              fullWidth
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddPlayer}
            variant="contained"
            disabled={!newPlayer.name}
          >
            Add Player
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlayerManagement; 