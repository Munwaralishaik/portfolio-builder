package com.portfolio.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.portfolio.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JavaMailSender mailSender;

   public AuthService(UserRepository userRepository, JavaMailSender mailSender) {
    this.userRepository = userRepository;
    this.mailSender = mailSender;
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
    public String forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    String token = UUID.randomUUID().toString();

    user.setResetToken(token);
    user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

    userRepository.save(user);

    String resetLink = "https://portfolio-builder-three-neon.vercel.app/reset_password.html?token=" + token;

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(user.getEmail());
    message.setSubject("Reset Your FolioForge Password");
    message.setText("Click this link to reset your password:\n\n" + resetLink);

    mailSender.send(message);

    return "Reset link sent to your email";
}

public String resetPassword(ResetPasswordRequest request) {
    User user = userRepository.findByResetToken(request.getToken())
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));

    if (user.getResetTokenExpiry().isBefore(LocalDateTime.now()))

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    user.setResetToken(null);
    user.setResetTokenExpiry(null);

    userRepository.save(user);

    return "Password reset successfully";
    }
}

