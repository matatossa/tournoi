package com.tournament.controller;

import com.tournament.model.Tournament;
import com.tournament.model.Team;
import com.tournament.model.TeamRegistrationRequest;
import com.tournament.repository.TournamentRepository;
import com.tournament.repository.TeamRepository;
import com.tournament.repository.TeamRegistrationRequestRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamRegistrationRequestRepository registrationRequestRepository;

    public TournamentController(TournamentRepository tournamentRepository, 
                              TeamRepository teamRepository,
                              TeamRegistrationRequestRepository registrationRequestRepository) {
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
        this.registrationRequestRepository = registrationRequestRepository;
    }

    @PostMapping
    public ResponseEntity<?> createTournament(@RequestBody TournamentRequest request, Authentication auth) {
        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setAdmin((com.tournament.model.User) auth.getPrincipal());
        
        return ResponseEntity.ok(tournamentRepository.save(tournament));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments(Authentication authentication) {
        System.out.println("[DEBUG] /api/tournaments principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
        return ResponseEntity.ok(tournamentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getTournament(@PathVariable Long id) {
        return tournamentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/teams")
    public ResponseEntity<Set<Team>> getTournamentTeams(@PathVariable Long id) {
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new RuntimeException("Tournament not found"));
        return ResponseEntity.ok(tournament.getTeams());
    }

    @PostMapping("/{id}/teams/{teamId}")
    public ResponseEntity<?> assignTeamToTournament(@PathVariable Long id, @PathVariable Long teamId) {
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new RuntimeException("Tournament not found"));
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        tournament.getTeams().add(team);
        return ResponseEntity.ok(tournamentRepository.save(tournament));
    }

    @DeleteMapping("/{id}/teams/{teamId}")
    public ResponseEntity<?> removeTeamFromTournament(@PathVariable Long id, @PathVariable Long teamId) {
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new RuntimeException("Tournament not found"));
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        tournament.getTeams().remove(team);
        return ResponseEntity.ok(tournamentRepository.save(tournament));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Long id) {
        tournamentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/register-team")
    public ResponseEntity<?> registerTeamForTournament(@PathVariable Long id, @RequestBody TeamRegistrationRequest request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        // Check if team is already registered
        if (tournament.getTeams().contains(request.getTeam())) {
            return ResponseEntity.badRequest().body("Team is already registered for this tournament");
        }

        // Check if tournament has reached team limit
        if (tournament.getTeams().size() >= 8) {
            return ResponseEntity.badRequest().body("Tournament has reached maximum team limit");
        }

        // Create registration request
        TeamRegistrationRequest registrationRequest = new TeamRegistrationRequest();
        registrationRequest.setTeam(request.getTeam());
        registrationRequest.setTournament(tournament);
        registrationRequest.setStatus("PENDING");
        registrationRequest.setRequestDate(LocalDateTime.now());

        return ResponseEntity.ok(registrationRequestRepository.save(registrationRequest));
    }

    @PostMapping("/{id}/registration-requests/{requestId}/approve")
    public ResponseEntity<?> approveTeamRegistration(@PathVariable Long id, @PathVariable Long requestId) {
        TeamRegistrationRequest request = registrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getTeams().size() >= 8) {
            return ResponseEntity.badRequest().body("Tournament has reached maximum team limit");
        }

        request.setStatus("APPROVED");
        request.setResponseDate(LocalDateTime.now());
        registrationRequestRepository.save(request);

        tournament.getTeams().add(request.getTeam());
        tournamentRepository.save(tournament);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/registration-requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectTeamRegistration(@PathVariable Long id, @PathVariable Long requestId, 
                                                  @RequestBody RejectionRequest rejectionRequest) {
        TeamRegistrationRequest request = registrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));

        request.setStatus("REJECTED");
        request.setRejectionMessage(rejectionRequest.getMessage());
        request.setResponseDate(LocalDateTime.now());
        registrationRequestRepository.save(request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/registration-requests")
    public ResponseEntity<List<TeamRegistrationRequest>> getRegistrationRequests(@PathVariable Long id) {
        return ResponseEntity.ok(registrationRequestRepository.findByTournamentId(id));
    }

    @GetMapping("/registration-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamRegistrationRequest>> getAllRegistrationRequests() {
        return ResponseEntity.ok(registrationRequestRepository.findAll());
    }

    @Data
    public static class TournamentRequest {
        private String name;
        private String description;
        private java.time.LocalDateTime startDate;
        private java.time.LocalDateTime endDate;
    }

    @Data
    public static class RejectionRequest {
        private String message;
    }
} 