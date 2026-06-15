package com.joblens.matching.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class MatchingConfig {

    private static final int SCORING_CONCURRENCY = 8;

    @Bean(destroyMethod = "shutdown")
    public ExecutorService scoringPool() {
        return Executors.newFixedThreadPool(SCORING_CONCURRENCY);
    }
}
