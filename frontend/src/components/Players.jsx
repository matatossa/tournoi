import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Players() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
    teamId: '',
  });

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  useEffect(() => {
    // If user is TEAM, set teamId automatically
    if (user?.role === 'TEAM' && user.teamId) {
      setNewPlayer((prev) => ({ ...prev, teamId: user.teamId }));
    }
  }, [user]);

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/players');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreatePlayer = async () => {
    try {
      await api.post('/players', newPlayer);
      setOpenDialog(false);
      setNewPlayer({ name: '', position: '', jerseyNumber: '', teamId: user?.role === 'TEAM' ? user.teamId : '' });
      fetchPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await api.delete(`/players/${playerId}`);
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'No Team';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Players</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Player
        </Button>
      </Box>

      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{player.name}</Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleDeletePlayer(player.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography color="textSecondary">
                  {player.position} - #{player.jerseyNumber}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Team: {getTeamName(player.team?.id)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Player</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Player Name"
            fullWidth
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Position"
            fullWidth
            value={newPlayer.position}
            onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Jersey Number"
            fullWidth
            type="number"
            value={newPlayer.jerseyNumber}
            onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })}
          />
          {user?.role === 'ADMIN' ? (
          <FormControl fullWidth margin="dense">
            <InputLabel>Team</InputLabel>
            <Select
              value={newPlayer.teamId}
              label="Team"
              onChange={(e) => setNewPlayer({ ...newPlayer, teamId: e.target.value })}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          ) : user?.role === 'TEAM' ? (
            <TextField
              margin="dense"
              label="Team"
              fullWidth
              value={getTeamName(user.teamId)}
              InputProps={{ readOnly: true }}
              disabled
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePlayer} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Players; 