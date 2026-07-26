package com.ecom.order.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("E-Commerce Order Management API")
                        .description("REST API for order management, product catalogue, checkout, and search")
                        .version("1.0.0")
                        .contact(new Contact().name("E-Com Team").email("dev@ecom.com"))
                        .license(new License().name("MIT")))
                .servers(List.of(new Server().url("/api").description("Default server")));
    }
}
