package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * CorsConfig - Cross-Origin Resource Sharing configuration.
 * Allows the deployed frontend (S3 static site) and local dev servers
 * to make API calls to this backend server.
 * Only applies to endpoints under /api/**.
 */
@Configuration
public class CorsConfig {

    /**
     * Creates a CORS filter bean that allows cross-origin requests.
     * Permitted origins: localhost dev servers and the S3-hosted frontend.
     * Permitted methods: GET, POST, PUT, DELETE, OPTIONS.
     * Credentials (cookies/auth headers) are allowed.
     *
     * @return configured CorsFilter applied to all /api/** endpoints
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://ironpulse-756912720870-us-east-1-an.s3-website-us-east-1.amazonaws.com"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}


