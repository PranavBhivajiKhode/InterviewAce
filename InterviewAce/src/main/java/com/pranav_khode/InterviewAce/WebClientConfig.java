package com.pranav_khode.InterviewAce;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

	@Value("${gemini.api.url}")
	private String geminiApiUrl;
	
	@Value("${gemini.api.key}")
	private String geminiApiKey;
	
	@Bean
	public WebClient geminiWebClient(WebClient.Builder webClientBuilder) {
		return webClientBuilder
				.baseUrl(geminiApiUrl)
				.defaultHeader("x-goog-api-key", geminiApiKey)
				.defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
				.build();
	}

}
