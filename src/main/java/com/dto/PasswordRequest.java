package com.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordRequest {

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public PasswordRequest() {}

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}