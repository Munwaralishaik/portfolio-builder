package com.portfolio.auth;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public User signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
    @PostMapping("/change-password")
public String changePassword(
        @RequestBody ChangePasswordRequest request) {

    return authService.changePassword(request);
    }
}