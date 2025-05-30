package com.tournament.service;

import com.tournament.model.*;
import com.tournament.repository.MatchRepository;
import com.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Comparator;

@Service
public class BracketService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public BracketService(MatchRepository matchRepository, TournamentRepository tournamentRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    @Transactional
    public void generateBracket(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<Team> teams = new ArrayList<>(tournament.getTeams());
        if (teams.size() < 2) {
            throw new RuntimeException("Need at least 2 teams to generate a bracket");
        }

        // Shuffle teams for random seeding
        Collections.shuffle(teams);

        // Calculate number of rounds needed
        int numTeams = teams.size();
        int numRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));

        // Create first round matches
        int matchNumber = 1;
        int matchesInFirstRound = numTeams / 2 + numTeams % 2;
        for (int i = 0; i < teams.size(); i += 2) {
            Match match = new Match();
            match.setTournament(tournament);
            match.setTeam1(teams.get(i));
            match.setTeam2(i + 1 < teams.size() ? teams.get(i + 1) : null); // Bye if odd number of teams
            match.setRound(1);
            match.setMatchNumber(matchNumber++);
            match.setScheduledTime(tournament.getStartDate());
            matchRepository.save(match);
        }

        // Create placeholder matches for subsequent rounds
        int matchesInPreviousRound = matchesInFirstRound;
        for (int round = 2; round <= numRounds; round++) {
            int matchesInThisRound = matchesInPreviousRound / 2 + matchesInPreviousRound % 2;
            for (int i = 0; i < matchesInThisRound; i++) {
                Match match = new Match();
                match.setTournament(tournament);
                match.setRound(round);
                match.setMatchNumber(matchNumber++);
                match.setScheduledTime(tournament.getStartDate().plusDays(round - 1));
                matchRepository.save(match);
            }
            matchesInPreviousRound = matchesInThisRound;
        }
    }

    @Transactional
    public void setMatchWinner(Long matchId, Long winnerTeamId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!match.getTeam1().getId().equals(winnerTeamId) && !match.getTeam2().getId().equals(winnerTeamId)) {
            throw new RuntimeException("Winner must be one of the teams in the match");
        }

        match.setWinner(match.getTeam1().getId().equals(winnerTeamId) ? match.getTeam1() : match.getTeam2());
        match.setStatus(Match.MatchStatus.COMPLETED);
        matchRepository.save(match);

        // Update next round match if exists
        updateNextRoundMatch(match);
    }

    private void updateNextRoundMatch(Match currentMatch) {
        Tournament tournament = currentMatch.getTournament();
        int currentRound = currentMatch.getRound();
        int nextRound = currentRound + 1;

        // Get all matches in the current round, sorted by matchNumber
        List<Match> currentRoundMatches = matchRepository.findByTournamentIdAndRound(tournament.getId(), currentRound)
            .stream().sorted(Comparator.comparingInt(Match::getMatchNumber)).toList();

        // Find the index of the current match in its round
        int indexInRound = -1;
        for (int i = 0; i < currentRoundMatches.size(); i++) {
            if (currentRoundMatches.get(i).getId().equals(currentMatch.getId())) {
                indexInRound = i;
                break;
            }
        }
        if (indexInRound == -1) return; // Should not happen

        // Find all matches in the next round, sorted by matchNumber
        List<Match> nextRoundMatches = matchRepository.findByTournamentIdAndRound(tournament.getId(), nextRound)
            .stream().sorted(Comparator.comparingInt(Match::getMatchNumber)).toList();

        if (nextRoundMatches.isEmpty()) return; // No next round

        int nextMatchIndex = indexInRound / 2;
        if (nextMatchIndex >= nextRoundMatches.size()) return; // Defensive

        Match nextMatch = nextRoundMatches.get(nextMatchIndex);
        if (indexInRound % 2 == 0) {
                        nextMatch.setTeam1(currentMatch.getWinner());
                    } else {
                        nextMatch.setTeam2(currentMatch.getWinner());
                    }
        nextMatch.setStatus(Match.MatchStatus.SCHEDULED);
                    matchRepository.save(nextMatch);
    }
} 