package com.cafeteria.config;

import com.cafeteria.auth.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175", // <-- NUEVO PUERTO PARA LA APP ADMIN
                "http://localhost:4173",
                "http://localhost:4174"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtUtil);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        // --- RUTAS PÚBLICAS ---
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/menu/**").permitAll()
                        .requestMatchers("/api/pedidos").permitAll()
                        .requestMatchers("/api/pedidos/mesa/**").permitAll()
                        .requestMatchers("/api/pedidos/*/confirmar").permitAll()
                        .requestMatchers("/api/pedidos/mesa/*/liberar").permitAll()
                        .requestMatchers("/ws-cafeteria/**").permitAll()
                        .requestMatchers("/api/mesas/token/**").permitAll()
                        .requestMatchers("/api/llamados").permitAll()

                        // --- RUTAS PARA BARISTA Y ADMIN ---
                        .requestMatchers("/api/pedidos/activos").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")
                        .requestMatchers("/api/pedidos/*/estado").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")
                        .requestMatchers("/api/llamados/pendientes").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")
                        .requestMatchers("/api/llamados/*/atender").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")
                        .requestMatchers("/api/admin/mesas").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")
                        .requestMatchers("/api/admin/mesas/*/liberar").hasAnyAuthority("ROLE_BARISTA", "ROLE_ADMIN")

                        // --- RUTAS EXCLUSIVAS DEL ADMIN ---
                        .requestMatchers("/api/baristas/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/admin/menu/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/admin/mesas/**").hasAuthority("ROLE_ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}