package com.aura;

import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
public class HealthService {
   private final JdbcTemplate jdbcTemplate;

    public HealthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    public HealthResponse getHealth() {

          Integer result = jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class
        );
        return new HealthResponse(
                "UP",
                "Aura backend is running.database returned"+result
        );
    }
}