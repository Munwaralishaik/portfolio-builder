package com.portfolio.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.portfolio.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

  public User signup(SignupRequest request) {
    User user = new User();

    user.setName(request.getName());
    user.setEmail(request.getEmail());

    if (request.getEmail().equalsIgnoreCase("mali8699031@gmail.com")) {
        user.setRole("ADMIN");
    } else {
        user.setRole("USER");
    }

    user.setPassword(
            passwordEncoder.encode(request.getPassword()));

    return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
    }

    public String changePassword(ChangePasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return "Password updated successfully";
    }
}