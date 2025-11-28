package com.pranav_khode.InterviewAce.user.database;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="user_id", updatable = false, nullable = false)
	private UUID userId;
	
	@Column(name = "first_name", nullable = false, length = 100)
	private String firstName;
	
	@Column(name="last_name", nullable = false, length=100)
	private String lastName;
	
	@Column(name="email", unique = true, nullable = false)
	private String email;
	
	@Column(name="encodedPassword", nullable = false)
	private String encodedPassword;
	
	
	public User() {}
	
	public UUID getUserId() {
		return userId;
	}
	public void setUserId(UUID userId) {
		this.userId = userId;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getEncodedPassword() {
		return encodedPassword;
	}
	public void setEncodedPassword(String encodedPassword) {
		this.encodedPassword = encodedPassword;
	}
}
