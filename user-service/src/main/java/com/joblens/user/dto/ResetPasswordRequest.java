package com.joblens.user.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
