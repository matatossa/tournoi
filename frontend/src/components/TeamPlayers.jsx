import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function TeamPlayers({ team, onUpdate }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
  });

  const handleAddPlayer = async () => {
    try {
      await axios.post(`/api/teams/${team.id}/players`, newPlayer);
      setOpenDialog(false);
      setNewPlayer({ name: '', position: '', jerseyNumber: '' });
      onUpdate();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await axios.delete(`/api/teams/${team.id}/players/${playerId}`);
      onUpdate();
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Players</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Player
        </Button>
      </Box>

      <List>
        {team.players?.map((player) => (
          <ListItem key={player.id}>
            <ListItemText
              primary={player.name}
              secondary={`${player.position} - #${player.jerseyNumber}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleRemovePlayer(player.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Player</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPlayer} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamPlayers; 