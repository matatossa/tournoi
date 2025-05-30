package com.tournament.controller;

import com.tournament.model.Match;
import com.tournament.service.BracketService;
import com.tournament.service.MatchService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/bracket")
public class BracketController {

    private final BracketService bracketService;
    private final MatchService matchService;

    public BracketController(BracketService bracketService, MatchService matchService) {
        this.bracketService = bracketService;
        this.matchService = matchService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateBracket(@PathVariable Long tournamentId) {
        try {
            bracketService.generateBracket(tournamentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/matches/{matchId}/winner")
    public ResponseEntity<?> setMatchWinner(
            @PathVariable Long matchId,
            @RequestBody WinnerRequest request) {
        try {
            bracketService.setMatchWinner(matchId, request.getWinnerTeamId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Match>> getBracket(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(matchService.getTournamentMatches(tournamentId));
    }

    @Data
    public static class WinnerRequest {
        private Long winnerTeamId;
    }
} 