package com.tournament.controller;

import com.tournament.model.Player;
import com.tournament.model.Team;
import com.tournament.repository.PlayerRepository;
import com.tournament.repository.TeamRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    public PlayerController(PlayerRepository playerRepository, TeamRepository teamRepository) {
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Player> createPlayer(@RequestBody PlayerRequest request) {
        Player player = new Player();
        player.setName(request.getName());
        player.setPosition(request.getPosition());
        player.setJerseyNumber(request.getJerseyNumber());
        
        if (request.getTeamId() != null) {
            return teamRepository.findById(request.getTeamId())
                    .map(team -> {
                        player.setTeam(team);
                        return ResponseEntity.ok(playerRepository.save(player));
                    })
                    .orElse(ResponseEntity.badRequest().<Player>build());
        }
        
        return ResponseEntity.ok(playerRepository.save(player));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlayer(@PathVariable Long id) {
        return playerRepository.findById(id)
                .map(player -> {
                    playerRepository.delete(player);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class PlayerRequest {
        private String name;
        private String position;
        private Integer jerseyNumber;
        private Long teamId;
    }
} 