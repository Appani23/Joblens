package com.joblens.aggregator.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "joblens.fetch")
@Getter
@Setter
public class FetchProperties {

    /** Polling interval in milliseconds. Default: 6 hours. */
    private long intervalMs = 21600000L;

    /** Initial delay after startup before the first fetch. Default: 1 minute. */
    private long initialDelayMs = 60000L;

    /** Search queries to run on each scheduled fetch cycle. */
    private List<QueryConfig> queries = new ArrayList<>();

    @Getter
    @Setter
    public static class QueryConfig {
        private String what;
        private String where;
    }
}
