package com.pranav_khode.InterviewAce.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record LoginDto(
		@NotNull @Email String email,
		@NotNull @NotEmpty String password
){}
