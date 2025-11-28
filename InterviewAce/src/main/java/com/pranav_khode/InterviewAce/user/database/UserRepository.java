package com.pranav_khode.InterviewAce.user.database;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

	public boolean existsByEmail(String email);

	public User findByEmail(String email);

}
