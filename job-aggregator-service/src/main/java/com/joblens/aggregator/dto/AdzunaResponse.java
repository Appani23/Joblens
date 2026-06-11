package com.joblens.aggregator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AdzunaResponse(
        int count,
        List<AdzunaJobResult> results
) {}
