package com.joblens.matching.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "anthropic")
@Getter @Setter
public class AnthropicProperties {
    private String apiKey;
    private String model;
    private String baseUrl;
}
