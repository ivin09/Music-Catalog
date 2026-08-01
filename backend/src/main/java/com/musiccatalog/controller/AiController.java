package com.musiccatalog.controller;

import com.musiccatalog.config.CurrentUserProvider;
import com.musiccatalog.entity.User;
import com.musiccatalog.service.AiInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInsightService aiInsightService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        return ResponseEntity.ok(aiInsightService.buildInsights(user));
    }
}
