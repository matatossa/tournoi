package com.tournament.controller;

import com.tournament.model.Match;
import com.tournament.model.Team;
import com.tournament.service.MatchService;
import com.tournament.repository.TeamRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/matches")
public class MatchController {

    private final MatchService matchService;
    private final TeamRepository teamRepository;

    public MatchController(MatchService matchService, TeamRepository teamRepository) {
        this.matchService = matchService;
        this.teamRepository = teamRepository;
    }

    @GetMapping
    public ResponseEntity<List<Match>> getTournamentMatches(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(matchService.getTournamentMatches(tournamentId));
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<Match> getMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(matchService.getMatch(matchId));
    }

    @PutMapping("/{matchId}")
    public ResponseEntity<Match> updateMatch(
            @PathVariable Long matchId,
            @RequestBody MatchUpdateRequest request) {
        Match matchUpdate = new Match();
        if (request.getTeam1Id() != null) {
            matchUpdate.setTeam1(teamRepository.findById(request.getTeam1Id()).orElse(null));
        }
        if (request.getTeam2Id() != null) {
            matchUpdate.setTeam2(teamRepository.findById(request.getTeam2Id()).orElse(null));
        }
        if (request.getWinnerId() != null) {
            matchUpdate.setWinner(teamRepository.findById(request.getWinnerId()).orElse(null));
        }
        matchUpdate.setStatus(request.getStatus());
        matchUpdate.setScheduledTime(request.getScheduledTime());
        return ResponseEntity.ok(matchService.updateMatch(matchId, matchUpdate));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<?> deleteMatch(@PathVariable Long matchId) {
        matchService.deleteMatch(matchId);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class MatchUpdateRequest {
        private Long team1Id;
        private Long team2Id;
        private Long winnerId;
        private Match.MatchStatus status;
        private java.time.LocalDateTime scheduledTime;
    }
} 