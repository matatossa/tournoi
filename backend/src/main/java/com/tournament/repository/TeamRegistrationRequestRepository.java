package com.tournament.repository;

import com.tournament.model.TeamRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface TeamRegistrationRequestRepository extends JpaRepository<TeamRegistrationRequest, Long> {
    List<TeamRegistrationRequest> findByTeamId(Long teamId);
    List<TeamRegistrationRequest> findByTournamentId(Long tournamentId);
    List<TeamRegistrationRequest> findByTeamIdAndStatus(Long teamId, String status);
} 