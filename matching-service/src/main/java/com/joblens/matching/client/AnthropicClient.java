package com.joblens.matching.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.joblens.matching.config.AnthropicProperties;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@Slf4j
public class AnthropicClient {

    // Max chars of job description sent to Claude — keeps token usage reasonable
    private static final int MAX_DESC_CHARS = 1200;

    private static final String PROMPT_TEMPLATE = """
            You are a job match scorer. Score how well this candidate matches this job.

            CANDIDATE PROFILE:
            %s

            JOB:
            Title: %s
            Description: %s

            SCORING RULES (return a single 0–100 integer):
            - SKILLS (~45%%): Overlap between candidate's skills and skills mentioned or implied by the job. High overlap = high score contribution.
            - TITLE FIT (~30%%): These are EQUIVALENT high-fit titles: "Java Developer", "Senior Java Developer", "Sr. Java Developer", "Java Full Stack Developer", "Full Stack Developer" (Java-based), "Backend Java Developer", "Java/J2EE Developer", adjacent Java-heavy "Software Engineer/Developer" roles. Unrelated roles (QA/Test Engineer, Flutter, COBOL-only, Account Manager, non-Java Architect) = low title fit.
            - EXPERIENCE FIT (~25%%): Candidate has %d years. If the job requires <= candidate years: full marks. 7–8 year requirement: small penalty (~5–10 pts). 9–12+ year "Expert/Architect" requirement: larger penalty (~15–25 pts). Never hard-reject on experience alone.

            Return ONLY valid JSON — no markdown fences, no preamble:
            {"score": <integer 0-100>, "reasoning": "<one concise sentence explaining the main driver>"}
            """;

    private final RestClient restClient;
    private final AnthropicProperties props;

    public AnthropicClient(RestClient.Builder builder, AnthropicProperties props) {
        this.props = props;
        this.restClient = builder
                .baseUrl(props.getBaseUrl())
                .defaultHeader("x-api-key", props.getApiKey())
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }

    @CircuitBreaker(name = "anthropic", fallbackMethod = "scoreFallback")
    @Retry(name = "anthropic")
    public String scoreJob(String resumeParsedJson, String jobTitle, String jobDescription, int candidateYears) {
        String truncatedDesc = jobDescription != null && jobDescription.length() > MAX_DESC_CHARS
                ? jobDescription.substring(0, MAX_DESC_CHARS) + "…"
                : (jobDescription != null ? jobDescription : "(no description)");

        String prompt = PROMPT_TEMPLATE.formatted(
                resumeParsedJson, jobTitle, truncatedDesc, candidateYears);

        var request = new MessagesRequest(
                props.getModel(),
                200,
                List.of(new Message("user", List.of(new ContentBlock("text", prompt))))
        );

        MessagesResponse response = restClient.post()
                .uri("/v1/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(MessagesResponse.class);

        if (response == null || response.content() == null || response.content().isEmpty()) {
            throw new IllegalStateException("Empty response from Claude");
        }

        return response.content().stream()
                .filter(c -> "text".equals(c.type()))
                .map(ContentItem::text)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No text block in Claude response"))
                .trim();
    }

    // Fallback — returns null to signal "skip this job"
    String scoreFallback(String resumeParsedJson, String jobTitle, String jobDescription,
                         int candidateYears, Throwable ex) {
        log.warn("Claude unavailable for job '{}': {}", jobTitle, ex.getMessage());
        return null;
    }

    // ── Request DTOs ─────────────────────────────────────────────────────────

    record MessagesRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            List<Message> messages
    ) {}

    record Message(String role, List<ContentBlock> content) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    record ContentBlock(String type, String text) {}

    // ── Response DTOs ─────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MessagesResponse(List<ContentItem> content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContentItem(String type, String text) {}
}
