package com.joblens.aggregator.dto;

public record IngestionSummary(int fetched, int saved, int duplicates) {}
