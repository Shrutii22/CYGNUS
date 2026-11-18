
package com.aura.agent;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AgentCorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/agent/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("POST", "OPTIONS")
                       .allowedHeaders("Content-Type", "Authorization");
            }
        };
    }
}
