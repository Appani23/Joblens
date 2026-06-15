package com.joblens.matching.controller;

import com.joblens.matching.dto.MatchResult;
import com.joblens.matching.dto.MatchSummary;
import com.joblens.matching.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Slf4j
public class MatchController {

    private final MatchingService matchingService;

    @PostMapping("/run")
    public ResponseEntity<?> run(Principal principal) {
        try {
            MatchSummary summary = matchingService.runForUser(principal.getName());
            return ResponseEntity.ok(summary);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<MatchResult>> getMatches(
            Principal principal,
            @RequestParam(defaultValue = "70") int minScore) {
        List<MatchResult> results = matchingService.getMatches(principal.getName(), minScore);
        return ResponseEntity.ok(results);
    }

    /** Called by the frontend after a new resume is uploaded to invalidate stale scores. */
    @DeleteMapping("/me")
    public ResponseEntity<Void> clearMatches(Principal principal) {
        matchingService.clearMatchesForUser(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
