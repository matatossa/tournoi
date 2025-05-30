package com.tournament.repository;

import com.tournament.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByAdminId(Long adminId);
    List<Tournament> findByStatus(Tournament.TournamentStatus status);
} 