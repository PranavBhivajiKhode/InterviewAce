package com.pranav_khode.InterviewAce.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pranav_khode.InterviewAce.user.database.User;
import com.pranav_khode.InterviewAce.user.dto.LoginDto;
import com.pranav_khode.InterviewAce.user.dto.SignupDto;
import com.pranav_khode.InterviewAce.user.response.ErrorResponse;
import com.pranav_khode.InterviewAce.user.service.UserAuthService;

@RestController
@RequestMapping("/auth")
public class UserController {
	
	private final UserAuthService userAuthService;
	
	public UserController(UserAuthService userAuthService) {
		this.userAuthService = userAuthService;
	}
	
	@GetMapping("/name")
	public String name() {
		return "pranav";
	}
	
	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody SignupDto dto) {
		try {
			User user = userAuthService.signupService(dto);
			return new ResponseEntity<>(user, HttpStatus.CREATED);
		}catch(Exception e) {
			System.out.println(e.toString());
			ErrorResponse error = new ErrorResponse(e.getMessage(), HttpStatus.CONFLICT.value(), System.currentTimeMillis());
			return new ResponseEntity<>(error, HttpStatus.CONFLICT);
		}
	}
	
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody LoginDto dto) {
		try {
			String token = userAuthService.loginService(dto);
			return ResponseEntity.ok().body(token);
		} catch (Exception e) {
			System.out.println(e.toString());
			return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
		}
	}
	
	
}
