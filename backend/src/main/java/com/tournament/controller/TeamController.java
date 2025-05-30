package com.tournament.controller;

import com.tournament.model.Team;
import com.tournament.model.Player;
import com.tournament.model.TeamRegistrationRequest;
import com.tournament.repository.TeamRepository;
import com.tournament.repository.PlayerRepository;
import com.tournament.repository.TeamRegistrationRequestRepository;
import com.tournament.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final TeamRegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;

    public TeamController(TeamRepository teamRepository, PlayerRepository playerRepository, TeamRegistrationRequestRepository registrationRequestRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.registrationRequestRepository = registrationRequestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody TeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setCity(request.getCity());
        team.setCountry(request.getCountry());
        
        return ResponseEntity.ok(teamRepository.save(team));
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeam(@PathVariable Long id) {
        return teamRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/players")
    public ResponseEntity<List<Player>> getTeamPlayers(@PathVariable Long id) {
        return ResponseEntity.ok(playerRepository.findByTeamId(id));
    }

    @PostMapping("/{teamId}/players")
    public ResponseEntity<?> addPlayerToTeam(@PathVariable Long teamId, @RequestBody PlayerRequest request) {
        return teamRepository.findById(teamId)
                .map(team -> {
                    Player player = new Player();
                    player.setName(request.getName());
                    player.setPosition(request.getPosition());
                    player.setJerseyNumber(request.getJerseyNumber());
                    player.setTeam(team);
                    return ResponseEntity.ok(playerRepository.save(player));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{teamId}/players/{playerId}")
    public ResponseEntity<?> removePlayerFromTeam(@PathVariable Long teamId, @PathVariable Long playerId) {
        return playerRepository.findById(playerId)
                .map(player -> {
                    if (player.getTeam().getId().equals(teamId)) {
                        player.setTeam(null);
                        playerRepository.save(player);
                        return ResponseEntity.ok().build();
                    }
                    return ResponseEntity.badRequest().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/tournament-registrations")
    public ResponseEntity<List<TeamRegistrationRequest>> getTeamRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(registrationRequestRepository.findByTeamId(id));
    }

    @GetMapping("/{id}/active-tournaments")
    public ResponseEntity<List<TeamRegistrationRequest>> getActiveTournaments(@PathVariable Long id) {
        return ResponseEntity.ok(registrationRequestRepository.findByTeamIdAndStatus(id, "APPROVED"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return teamRepository.findById(id)
                    .map(team -> {
                        try {
                            // Remove team reference from users
                            userRepository.findByTeamId(id).forEach(user -> {
                                user.setTeam(null);
                                userRepository.save(user);
                            });
                            teamRepository.delete(team);
                            return ResponseEntity.ok().build();
                        } catch (Exception e) {
                            return ResponseEntity.badRequest().body("Cannot delete team because it is referenced by users.");
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(403).build();
    }

    @Data
    public static class TeamRequest {
        private String name;
        private String city;
        private String country;
    }

    @Data
    public static class PlayerRequest {
        private String name;
        private String position;
        private Integer jerseyNumber;
    }
} 