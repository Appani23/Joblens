package com.joblens.aggregator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AdzunaJobResult(
        String id,
        String title,
        String description,
        @JsonProperty("redirect_url") String redirectUrl,
        String created,
        @JsonProperty("salary_min") Double salaryMin,
        @JsonProperty("salary_max") Double salaryMax,
        Company company,
        Location location
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Company(@JsonProperty("display_name") String displayName) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Location(@JsonProperty("display_name") String displayName) {}
}
