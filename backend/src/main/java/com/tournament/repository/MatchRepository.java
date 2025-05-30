package com.tournament.repository;

import com.tournament.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournamentIdOrderByRoundAscMatchNumberAsc(Long tournamentId);
    List<Match> findByTournamentIdAndRound(Long tournamentId, Integer round);
    List<Match> findByTeam1IdOrTeam2Id(Long teamId, Long teamId2);
} 