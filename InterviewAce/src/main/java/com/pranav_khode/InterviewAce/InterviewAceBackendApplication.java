package com.pranav_khode.InterviewAce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.pranav_khode.InterviewAce.security.RsaKeyProperties;

@SpringBootApplication
@EnableConfigurationProperties(RsaKeyProperties.class)
public class InterviewAceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewAceBackendApplication.class, args);
	}

}
