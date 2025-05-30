import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../api';
import { Bracket, Seed, SeedItem, SeedTeam, SeedTime } from 'react-brackets';

// Wrapper component to suppress strict mode warnings
const StrictModeWrapper = ({ children }) => {
  // This wrapper simply returns its children without strict mode
  return children;
};

const MatchBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  minWidth: 200,
  position: 'relative',
  '&.winner': {
    backgroundColor: theme.palette.success.light,
  },
}));

const TournamentBracket = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState([]);

  const fetchTournament = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}`);
      setTournament(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setTournament(null);
        console.error('Forbidden: You do not have access to this tournament.');
      } else {
        console.error('Error fetching tournament:', error);
      }
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/bracket`);
      setMatches(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMatches([]);
        console.error('Forbidden: You do not have access to these matches.');
      } else {
        console.error('Error fetching matches:', error);
      }
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/teams`);
      setTeams(response.data);
    } catch (error) {
      setTeams([]);
      console.error('Error fetching teams:', error);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/bracket/generate`);
      if (response.status === 200) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Error generating bracket:', error);
    }
  };

  const handleSetWinner = async (matchId, winnerTeamId) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/bracket/matches/${matchId}/winner`, {
        winnerTeamId,
      });
      if (response.status === 200) {
        setTimeout(fetchMatches, 200);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

  useEffect(() => {
    fetchTournament();
    fetchMatches();
    fetchTeams();
    // eslint-disable-next-line
  }, [tournamentId]);

  const getMatchesByRound = (round) => {
    return matches.filter((match) => match.round === round);
  };

  const renderMatch = (match) => {
    const isWinner = (team) => match.winner?.id === team?.id;

    return (
      <MatchBox
        key={match.id}
        elevation={3}
        className={match.status === 'COMPLETED' ? 'winner' : ''}
        onClick={() => {
          if (match.status === 'SCHEDULED') {
            setSelectedMatch(match);
            setOpen(true);
          }
        }}
        sx={{ cursor: match.status === 'SCHEDULED' ? 'pointer' : 'default' }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          Match {match.matchNumber}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="body1"
            sx={{ color: isWinner(match.team1) ? 'success.main' : 'inherit' }}
          >
            {match.team1?.name || 'TBD'}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: isWinner(match.team2) ? 'success.main' : 'inherit' }}
          >
            {match.team2?.name || 'TBD'}
          </Typography>
        </Box>
        {match.status === 'COMPLETED' && (
          <Typography variant="caption" color="success.main">
            Winner: {match.winner?.name}
          </Typography>
        )}
      </MatchBox>
    );
  };

  // Helper to transform your matches into the format expected by react-tournament-bracket
  const transformMatchesToRounds = (matches) => {
    if (!matches || matches.length === 0) return [];
    const rounds = [];
    const maxRound = Math.max(...matches.map(m => m.round));
    for (let round = 1; round <= maxRound; round++) {
      const seeds = matches
        .filter(m => m.round === round)
        .map(m => ({
          id: m.id,
          date: m.scheduledTime,
          teams: [
            m.team1 ? { name: m.team1.name } : { name: 'TBD' },
            m.team2 ? { name: m.team2.name } : { name: 'TBD' },
          ],
          winner: m.winner ? { name: m.winner.name } : null,
          match: m,
        }));
      rounds.push({ title: `Round ${round}`, seeds });
    }
    return rounds;
  };

  const rounds = transformMatchesToRounds(matches);

  // Custom seed renderer to handle clicks
  const renderCustomSeed = ({ seed, breakpoint }) => {
    const match = seed.match; // This contains our original match data
    const isWinner = (team) => match.winner?.id === team?.id;

    return (
      <Seed
        key={seed.id}
        mobileBreakpoint={breakpoint}
        onClick={() => {
          if (match.status === 'SCHEDULED') {
            setSelectedMatch(match);
            setOpen(true);
          }
        }}
        style={{ cursor: match.status === 'SCHEDULED' ? 'pointer' : 'default' }}
      >
        <SeedItem>
          <div>
            <SeedTeam style={{ 
              color: isWinner(match.team1) ? '#4caf50' : 'inherit',
              backgroundColor: isWinner(match.team1) ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
            }}>
              {match.team1?.name || 'TBD'}
            </SeedTeam>
            <SeedTeam style={{ 
              color: isWinner(match.team2) ? '#4caf50' : 'inherit',
              backgroundColor: isWinner(match.team2) ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
            }}>
              {match.team2?.name || 'TBD'}
            </SeedTeam>
          </div>
        </SeedItem>
        {match.status === 'COMPLETED' && (
          <SeedTime mobileBreakpoint={breakpoint}>
            Winner: {match.winner?.name}
          </SeedTime>
        )}
      </Seed>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{tournament?.name} Bracket</Typography>
        <Button
          variant="contained"
          onClick={handleGenerateBracket}
          disabled={matches.length > 0}
        >
          Generate Bracket
        </Button>
      </Box>

      {/* Assigned Teams List */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Assigned Teams</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {teams.length === 0 ? (
            <Typography color="textSecondary">No teams assigned.</Typography>
          ) : (
            teams.map((team) => (
              <Paper key={team.id} sx={{ p: 1, minWidth: 120 }}>
                <Typography>{team.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {team.city}, {team.country}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </Box>

      {/* Render the professional bracket using react-brackets */}
      <StrictModeWrapper>
        <Bracket 
          rounds={rounds} 
          mobileBreakpoint={0}
          swipeableProps={{ disabled: true }}
          renderSeedComponent={renderCustomSeed}
        />
      </StrictModeWrapper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select Winner</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Winner</InputLabel>
            <Select
              value=""
              label="Winner"
              onChange={(e) => handleSetWinner(selectedMatch.id, e.target.value)}
            >
              <MenuItem value={selectedMatch?.team1?.id}>
                {selectedMatch?.team1?.name}
              </MenuItem>
              <MenuItem value={selectedMatch?.team2?.id}>
                {selectedMatch?.team2?.name}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentBracket; 