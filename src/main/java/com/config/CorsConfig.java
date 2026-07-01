package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * CorsConfig - Cross-Origin Resource Sharing configuration.
 * Allows the frontend (React on localhost:5173, localhost:3000, or localhost:8082)
 * to make API calls to this backend server.
 * Only applies to endpoints under /api/**.
 */
@Configuration
public class CorsConfig {

    /**
     * Creates a CORS filter bean that allows cross-origin requests.
    * Permitted origins: localhost:5173, localhost:3000, and localhost:8082.
     * Permitted methods: GET, POST, PUT, DELETE, OPTIONS.
     * Credentials (cookies/auth headers) are allowed.
     *
     * @return configured CorsFilter applied to all /api/** endpoints
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}


