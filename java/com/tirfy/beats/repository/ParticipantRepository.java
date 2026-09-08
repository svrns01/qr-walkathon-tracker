package com.tirfy.beats.repository;

import com.tirfy.beats.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    Optional<Participant> findByParticipantCode(String participantCode);

    Optional<Participant> findByQrToken(String qrToken);

    boolean existsByParticipantCode(String participantCode);

    boolean existsByQrToken(String qrToken);
}