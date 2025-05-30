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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';
import TeamPlayers from './TeamPlayers';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const handleCreateTeam = async () => {
    try {
      await api.post('/teams', newTeam);
      setOpenDialog(false);
      setNewTeam({ name: '', city: '', country: '' });
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await api.delete(`/teams/${teamId}`);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert(error.response?.data || 'Error deleting team');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Teams</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Team
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(teams) && teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{team.name}</Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography color="textSecondary">
                  {team.city}, {team.country}
                </Typography>
                <TeamPlayers team={team} onUpdate={fetchTeams} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="City"
            fullWidth
            value={newTeam.city}
            onChange={(e) => setNewTeam({ ...newTeam, city: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Country"
            fullWidth
            value={newTeam.country}
            onChange={(e) => setNewTeam({ ...newTeam, country: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Teams; 