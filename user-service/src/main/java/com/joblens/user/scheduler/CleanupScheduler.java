package com.joblens.user.scheduler;

import com.joblens.user.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {

    private final PasswordResetTokenRepository tokenRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
