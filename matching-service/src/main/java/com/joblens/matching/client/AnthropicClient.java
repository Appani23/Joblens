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

    private static final int MAX_DESC_CHARS = 1200;

    private static final String PROMPT_TEMPLATE = """
            You are a job match scorer and job-attribute extractor.

            CANDIDATE PROFILE:
            %s

            JOB:
            Title: %s
            Description: %s

            TASK 1 — SCORE (0-100 integer):
            - SKILLS (~45%%): Overlap between the candidate's skills/tools and what the job requires or implies. Consider both explicit mentions and strong implications (e.g. Spring Boot implies Java).
            - TITLE FIT (~30%%): How well the job title aligns with the candidate's background and target role based on their profile.
            - EXPERIENCE FIT (~25%%): Candidate has %d years. If the job requires <= candidate years: full marks. 7–8 year requirement: small penalty (~5–10 pts). 9–12+ year requirement: larger penalty (~15–25 pts). Never hard-reject on experience alone.

            TASK 2 — EXTRACT from the job description:
            - workMode: "Remote" if fully remote/WFH, "Hybrid" if hybrid/flexible schedule, "Onsite" otherwise.
            - requiredYears: The minimum years of experience required. Extract carefully:
              • Spelled-out numbers: "five years" = 5, "three to five years" → lower bound = 3
              • Numeric ranges: "3-5 years" or "3 to 5 years" → lower bound = 3
              • Months: "84 months" → 7, "60 months" → 5 (divide by 12, round to nearest integer)
              • Key phrases: "minimum of X", "at least X years", "X+ years of experience", "X years required"
              • If multiple mentions, use the primary required one; ignore "preferred" or "nice to have"
              • Return 0 ONLY if absolutely no experience requirement is stated anywhere

            TASK 3 — MATCHED SKILLS:
            From the candidate's skills in the CANDIDATE PROFILE, list the ones directly relevant to this specific job.
            Return as a JSON array of strings (max 8 items), using the exact skill names from the candidate's profile.
            Return [] if no skills from the candidate profile match this job.

            Return ONLY valid JSON — no markdown fences, no extra text:
            {"score": <integer 0-100>, "reasoning": "<one concise sentence>", "workMode": "<Remote|Hybrid|Onsite>", "requiredYears": <integer>, "matchedSkills": [<strings>]}
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
                500,
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

    String scoreFallback(String resumeParsedJson, String jobTitle, String jobDescription,
                         int candidateYears, Throwable ex) {
        log.warn("Claude unavailable for job '{}': {}", jobTitle, ex.getMessage());
        return null;
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────

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
