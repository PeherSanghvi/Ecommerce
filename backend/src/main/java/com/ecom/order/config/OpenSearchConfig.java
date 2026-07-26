package com.ecom.order.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.opensearch.client.RestClient;
import org.opensearch.client.RestClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the OpenSearch low-level RestClient using Apache HttpClient 4
 * (which opensearch-rest-client depends on internally).
 */
@Configuration
@RequiredArgsConstructor
public class OpenSearchConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenSearchConfig.class);

    private final OpenSearchProperties properties;

    @Bean
    public RestClient openSearchRestClient() {
        log.info("Connecting to OpenSearch at {}://{}:{}",
                properties.getScheme(), properties.getHost(), properties.getPort());

        HttpHost host = new HttpHost(
                properties.getHost(),
                properties.getPort(),
                properties.getScheme());

        final BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        if (properties.getUsername() != null && !properties.getUsername().isBlank()) {
            credentialsProvider.setCredentials(
                    new AuthScope(host),
                    new UsernamePasswordCredentials(
                            properties.getUsername(),
                            properties.getPassword()));
        }

        RestClientBuilder builder = RestClient.builder(host)
                .setHttpClientConfigCallback(httpClientBuilder ->
                        httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider));

        return builder.build();
    }
}
