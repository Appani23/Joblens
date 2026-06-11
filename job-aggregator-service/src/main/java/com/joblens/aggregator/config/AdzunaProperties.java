package com.joblens.aggregator.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "adzuna")
@Getter
@Setter
public class AdzunaProperties {

    private String appId;
    private String appKey;
    private String baseUrl;
}
