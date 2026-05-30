package com.portfolio.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.portfolio.auth.User;
import com.portfolio.dto.PortfolioRequest;
import com.portfolio.entity.Portfolio;
import com.portfolio.repository.PortfolioRepository;
import com.portfolio.repository.UserRepository;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }

    public List<Portfolio> getAllPortfolios() {
        return portfolioRepository.findAll();
    }

    public Portfolio savePortfolio(PortfolioRequest request) {

        Portfolio portfolio = new Portfolio();

        portfolio.setName(request.getName());
        portfolio.setRole(request.getRole());
        portfolio.setAbout(request.getAbout());
        portfolio.setSkills(request.getSkills());

        portfolio.setGithub(request.getGithub());
        portfolio.setLinkedin(request.getLinkedin());
        portfolio.setEmail(request.getEmail());
        portfolio.setPhone(request.getPhone());

        portfolio.setImage(request.getImage());
        portfolio.setResume(request.getResume());
        portfolio.setProjects(request.getProjects());
        portfolio.setCertifications(request.getCertifications());
        portfolio.setExperiences(request.getExperiences());

        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "-");

        portfolio.setSlug(slug);

        User user = userRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        portfolio.setUser(user);

        return portfolioRepository.save(portfolio);
    }

    public Portfolio updatePortfolio(String slug, PortfolioRequest request) {

        Portfolio portfolio = portfolioRepository
                .findTopBySlugOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        portfolio.setName(request.getName());
        portfolio.setRole(request.getRole());
        portfolio.setAbout(request.getAbout());
        portfolio.setSkills(request.getSkills());

        portfolio.setGithub(request.getGithub());
        portfolio.setLinkedin(request.getLinkedin());
        portfolio.setEmail(request.getEmail());
        portfolio.setPhone(request.getPhone());

        portfolio.setImage(request.getImage());
        portfolio.setResume(request.getResume());

        portfolio.setProjects(request.getProjects());
        portfolio.setCertifications(request.getCertifications());
        portfolio.setExperiences(request.getExperiences());

        String newSlug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "-");

        portfolio.setSlug(newSlug);

        User user = userRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        portfolio.setUser(user);

        return portfolioRepository.save(portfolio);
    }

    public Portfolio getPortfolioBySlug(String slug) {
        return portfolioRepository.findTopBySlugOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Portfolio not found with slug: " + slug));
    }

    public void deletePortfolio(String slug) {

        Portfolio portfolio = portfolioRepository
                .findTopBySlugOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        portfolioRepository.delete(portfolio);
    }

    public List<Portfolio> getPortfoliosByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return portfolioRepository.findByUser(user);
    }
}