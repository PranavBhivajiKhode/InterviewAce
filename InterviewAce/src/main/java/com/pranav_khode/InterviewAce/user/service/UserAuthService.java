package com.pranav_khode.InterviewAce.user.service;

import java.time.Instant;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.pranav_khode.InterviewAce.user.database.User;
import com.pranav_khode.InterviewAce.user.database.UserRepository;
import com.pranav_khode.InterviewAce.user.dto.LoginDto;
import com.pranav_khode.InterviewAce.user.dto.SignupDto;


@Service
public class UserAuthService {
	
	private final UserRepository userReppository;
	private final PasswordEncoder passwordEncoder;
	private final JwtEncoder jwtEncoder;
	
	public UserAuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
			JwtEncoder jwtEncoder) {
		this.userReppository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtEncoder =  jwtEncoder;
	}
	
	public User signupService(SignupDto dto) throws Exception{
		
		if(userReppository.existsByEmail(dto.email())) {
			throw new Exception("Email " + dto.email() + " already in use");
		}
		
		User user = new User();
		user.setFirstName(dto.firstName());
		user.setLastName(dto.lastName());
		user.setEmail(dto.email());
		user.setEncodedPassword(passwordEncoder.encode(dto.password()));
		
		return userReppository.save(user);
	}

	public String loginService(LoginDto dto) throws Exception {
		User user = userReppository.findByEmail(dto.email());
		
		if(user == null) {
			throw new Exception("User with email " + dto.email() + " does not exists");
		}
		
		if(!passwordEncoder.matches(dto.password(), user.getEncodedPassword())) {
			throw new BadCredentialsException("Invalid password");
		}
		
		String token = createToken(user);
		
		return token;
	}
	
	public String createToken(User user) {
		JwtClaimsSet claims = JwtClaimsSet.builder()
			.issuer("InterviewAce")
			.subject(user.getEmail())
			.issuedAt(Instant.now())
			.expiresAt(Instant.now().plusSeconds(3600))
			.claim("username", user.getFirstName() + " " + user.getLastName())
			.claim("userId", user.getUserId())
			.build();
		
		return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
	}
	
	
}
