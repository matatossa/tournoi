import React, { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import api from '../api';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [newTournament, setNewTournament] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const { user } = useAuth();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningTournament, setAssigningTournament] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      // Ensure we have an array, even if empty
      setTournaments(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError('Failed to fetch tournaments. Please try again.');
      setTournaments([]); // Reset to empty array on error
    }
  };

  const handleCreateTournament = async () => {
    try {
      // Convert dates to ISO format with time
      const startDateTime = new Date(newTournament.startDate + 'T00:00:00').toISOString();
      const endDateTime = new Date(newTournament.endDate + 'T23:59:59').toISOString();

      const response = await api.post('/tournaments', {
          ...newTournament,
          startDate: startDateTime,
          endDate: endDateTime
      });
      
      if (response.status === 200) {
        setOpen(false);
        setNewTournament({ name: '', startDate: '', endDate: '' });
        fetchTournaments();
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      setError('Failed to create tournament. Please try again.');
    }
  };

  const handleDeleteTournament = async (id) => {
    try {
      const response = await api.delete(`/tournaments/${id}`);
      if (response.status === 200) {
        fetchTournaments();
      }
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      if (error.response && error.response.status === 403) {
        setError('You do not have permission to delete this tournament.');
      } else {
        setError('Failed to delete tournament. Please try again.');
      }
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
    }
  };

  const openAssignTeamsDialog = async (tournament) => {
    setAssigningTournament(tournament);
    setAssignDialogOpen(true);
    // Fetch all teams
    const allTeamsRes = await api.get('/teams');
    setAllTeams(allTeamsRes.data);
    // Fetch assigned teams
    const assignedRes = await api.get(`/tournaments/${tournament.id}/teams`);
    setAssignedTeams(assignedRes.data.map(t => t.id));
    setSelectedTeams(assignedRes.data.map(t => t.id));
  };

  const handleToggleTeam = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleAssignTeams = async () => {
    const toAdd = selectedTeams.filter(id => !assignedTeams.includes(id));
    const toRemove = assignedTeams.filter(id => !selectedTeams.includes(id));
    // Assign new teams
    await Promise.all(toAdd.map(id => api.post(`/tournaments/${assigningTournament.id}/teams/${id}`)));
    // Remove unassigned teams
    await Promise.all(toRemove.map(id => api.delete(`/tournaments/${assigningTournament.id}/teams/${id}`)));
    setAssignDialogOpen(false);
    setAssigningTournament(null);
    fetchTournaments();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tournaments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create Tournament
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component={Link} to={`/tournaments/${tournament.id}/bracket`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {tournament.name}
                  </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/tournaments/${tournament.id}/bracket`}
                      sx={{ mr: 1 }}
                    >
                      View Bracket
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => openAssignTeamsDialog(tournament)} sx={{ mr: 1 }}>Assign Teams</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                    <IconButton onClick={() => { setTournamentToDelete(tournament); setDeleteDialogOpen(true); }} color="error">
                    <DeleteIcon />
                  </IconButton>
                    <Typography variant="caption" color="error">Delete</Typography>
                </Box>
                <Typography color="textSecondary">
                  {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Teams: {tournament.teams?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" align="center">
              No tournaments found. Create your first tournament!
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Tournament</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tournament Name"
            fullWidth
            value={newTournament.name}
            onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTournament.startDate}
            onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTournament.endDate}
            onChange={(e) => setNewTournament({ ...newTournament, endDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTournament} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Teams to Tournament</DialogTitle>
        <DialogContent>
          <List>
            {allTeams.map((team) => (
              <ListItem key={team.id} button onClick={() => handleToggleTeam(team.id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedTeams.includes(team.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={team.name} secondary={`${team.city}, ${team.country}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTeams} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the tournament "{tournamentToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteTournament(tournamentToDelete.id)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tournaments; 