package com.ecom.order.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "opensearch")
public class OpenSearchProperties {
    private String host = "localhost";
    private int port = 9200;
    private String scheme = "http";
    private String username = "admin";
    private String password = "admin";
    private Index index = new Index();

    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getScheme() { return scheme; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public Index getIndex() { return index; }

    @Data
    public static class Index {
        private String orders = "orders";

        public String getOrders() {
            return orders;
        }
    }
}
