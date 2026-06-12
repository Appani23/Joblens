package com.joblens.resume.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.joblens.resume.config.AnthropicProperties;
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

    private static final String SYSTEM_PROMPT = """
            Extract structured information from this resume.
            Return ONLY valid JSON — no markdown fences, no preamble, no explanation.
            The JSON object must have exactly these fields:
            {
              "skills": ["string"],
              "yearsExperience": number,
              "jobTitles": ["string"],
              "seniorityLevel": "junior|mid|senior|lead",
              "summary": "1-2 sentence professional summary",
              "location": "city, state  (or Remote)"
            }
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

    @CircuitBreaker(name = "anthropic", fallbackMethod = "parseFallback")
    @Retry(name = "anthropic")
    public String parse(String base64Pdf) {
        var request = new MessagesRequest(
                props.getModel(),
                1024,
                List.of(new Message(
                        "user",
                        List.of(
                                new ContentBlock("document", null,
                                        new Source("base64", "application/pdf", base64Pdf)),
                                new ContentBlock("text", SYSTEM_PROMPT, null)
                        )
                ))
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

        String text = response.content().stream()
                .filter(c -> "text".equals(c.type()))
                .map(ContentItem::text)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No text block in Claude response"));

        log.debug("Claude raw response: {}", text);
        return text.trim();
    }

    // Fallback — called when all retries fail or circuit is open
    String parseFallback(String base64Pdf, Throwable ex) {
        log.warn("Claude API unavailable, skipping parse: {}", ex.getMessage());
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
    record ContentBlock(String type, String text, Source source) {}

    record Source(
            String type,
            @JsonProperty("media_type") String mediaType,
            String data
    ) {}

    // ── Response DTOs ─────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MessagesResponse(List<ContentItem> content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContentItem(String type, String text) {}
}
