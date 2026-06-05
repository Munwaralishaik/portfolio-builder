package com.portfolio.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.portfolio.repository.PortfolioRepository;
import com.portfolio.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;

    public AdminController(UserRepository userRepository,
            PortfolioRepository portfolioRepository) {
        this.userRepository = userRepository;
        this.portfolioRepository = portfolioRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalPortfolios", portfolioRepository.count());

        Long totalViews = portfolioRepository.findAll()
                .stream()
                .mapToLong(p -> p.getViews() == null ? 0 : p.getViews())
                .sum();

        stats.put("totalViews", totalViews);

        return stats;
    }
}