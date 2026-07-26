package com.ecom.order.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret = "mySecretKeyForJWTTokenGenerationThatShouldBeLongEnough";
    private long expiration = 86400000; // 24 hours in milliseconds
}
