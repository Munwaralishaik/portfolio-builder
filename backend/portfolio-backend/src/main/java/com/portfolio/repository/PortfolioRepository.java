package com.portfolio.repository;

import java.util.List;
import com.portfolio.auth.User;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portfolio.entity.Portfolio;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    // Optional<Portfolio> findBySlug(String slug);

    Optional<Portfolio> findTopBySlugOrderByIdDesc(String slug);

    List<Portfolio> findByUser(User user);
}