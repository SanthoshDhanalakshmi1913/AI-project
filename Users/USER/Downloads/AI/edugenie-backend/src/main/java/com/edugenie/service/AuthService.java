package com.edugenie.service;

import com.edugenie.dto.UserResponse;
import com.edugenie.request.LoginRequest;
import com.edugenie.request.RegisterRequest;
import com.edugenie.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);
}
