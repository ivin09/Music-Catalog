package com.musiccatalog.controller;

import com.musiccatalog.config.CurrentUserProvider;
import com.musiccatalog.entity.User;
import com.musiccatalog.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return ResponseEntity.ok(analyticsService.buildAnalytics(user));
    }
}
