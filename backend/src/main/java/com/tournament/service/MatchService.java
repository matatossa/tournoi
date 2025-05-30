package com.tournament.service;

import com.tournament.model.Match;
import com.tournament.model.Tournament;
import com.tournament.repository.MatchRepository;
import com.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public MatchService(MatchRepository matchRepository, TournamentRepository tournamentRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<Match> getTournamentMatches(Long tournamentId) {
        return matchRepository.findByTournamentIdOrderByRoundAscMatchNumberAsc(tournamentId);
    }

    public Match getMatch(Long matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
    }

    @Transactional
    public Match updateMatch(Long matchId, Match matchUpdate) {
        Match match = getMatch(matchId);
        
        if (matchUpdate.getTeam1() != null) {
            match.setTeam1(matchUpdate.getTeam1());
        }
        if (matchUpdate.getTeam2() != null) {
            match.setTeam2(matchUpdate.getTeam2());
        }
        if (matchUpdate.getWinner() != null) {
            match.setWinner(matchUpdate.getWinner());
        }
        if (matchUpdate.getStatus() != null) {
            match.setStatus(matchUpdate.getStatus());
        }
        if (matchUpdate.getScheduledTime() != null) {
            match.setScheduledTime(matchUpdate.getScheduledTime());
        }
        
        return matchRepository.save(match);
    }

    @Transactional
    public void deleteMatch(Long matchId) {
        Match match = getMatch(matchId);
        matchRepository.delete(match);
    }

    public List<Match> getTeamMatches(Long teamId) {
        return matchRepository.findByTeam1IdOrTeam2Id(teamId, teamId);
    }
} 