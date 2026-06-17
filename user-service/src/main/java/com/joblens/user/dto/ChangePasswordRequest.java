package com.joblens.user.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
