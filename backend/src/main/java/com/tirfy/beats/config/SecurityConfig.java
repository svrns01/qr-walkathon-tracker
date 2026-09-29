package com.tirfy.beats.config;

import com.tirfy.beats.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // AUTHENTICATION
                        // ==========================================

                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // ==========================================
                        // HEALTH CHECK
                        // ==========================================
                        .requestMatchers("/health", "/error")
                        .permitAll()

                        // ==========================================
                        // QR SCANNER
                        // ==========================================

                        .requestMatchers(
                                "/api/checkpoints/scan"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN",
                                "VOLUNTEER"
                        )


                        // ==========================================
                        // DASHBOARD / REPORTS
                        // ==========================================

                        .requestMatchers(
                                "/api/dashboard/**",
                                "/api/reports/**"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN",
                                "VOLUNTEER",
                                "VIEWER"
                        )


                        // ==========================================
                        // USER MANAGEMENT
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users"
                        )
                        .hasRole("ROOT")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users"
                        )
                        .hasRole("ROOT")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/*"
                        )
                        .hasRole("ROOT")


                        // ==========================================
                        // USER CHECKPOINT ACCESS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/*/checkpoints"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN",
                                "VOLUNTEER"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/*/checkpoints"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN"
                        )


                        // ==========================================
                        // PARTICIPANTS
                        // ==========================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/participants"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN",
                                "VOLUNTEER"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/participants/import"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN"
                        )

                        .requestMatchers(
                                "/api/participants/**",
                                "/api/checkpoints/**"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN"
                        )


                        // ==========================================
                        // OFFLINE SYNC
                        // ==========================================

                        .requestMatchers(
                                "/api/scans/sync"
                        )
                        .hasAnyRole(
                                "ROOT",
                                "ADMIN",
                                "VOLUNTEER"
                        )


                        // ==========================================
                        // EVERYTHING ELSE
                        // ==========================================

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    // ==========================================
    // CORS
    // ==========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "https://tirfy142-beats.netlify.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}
