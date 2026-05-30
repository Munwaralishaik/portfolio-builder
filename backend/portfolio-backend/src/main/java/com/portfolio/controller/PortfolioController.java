package com.portfolio.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;

import com.portfolio.dto.PortfolioRequest;
import com.portfolio.entity.Portfolio;
import com.portfolio.service.PortfolioService;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = "*")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @PostMapping
    public Portfolio createPortfolio(@RequestBody PortfolioRequest request) {
        return portfolioService.savePortfolio(request);
    }

    @GetMapping
    public List<Portfolio> getAllPortfolios() {
        return portfolioService.getAllPortfolios();
    }

    @GetMapping("/{slug}")
    public Portfolio getPortfolio(@PathVariable String slug) {
        return portfolioService.getPortfolioBySlug(slug);
    }

    @PutMapping("/{slug}")
    public Portfolio updatePortfolio(
            @PathVariable String slug,
            @RequestBody PortfolioRequest request) {

        return portfolioService.updatePortfolio(slug, request);
    }

    @DeleteMapping("/{slug}")
    public String deletePortfolio(@PathVariable String slug) {
        portfolioService.deletePortfolio(slug);
        return "Portfolio Deleted Successfully";
    }

    @GetMapping("/my/{email}")
    public List<Portfolio> getMyPortfolios(@PathVariable String email) {
        return portfolioService.getPortfoliosByUserEmail(email);
    }
}