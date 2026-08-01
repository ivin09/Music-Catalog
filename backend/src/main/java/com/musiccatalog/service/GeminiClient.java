package com.musiccatalog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Optional upgrade path for the AI feature. If GEMINI_API_KEY is set, the deterministic
 * stats-based summary (built by AiInsightService) is rewritten into a short natural-language
 * paragraph by Gemini. If the key is absent, or the call fails for any reason, callers fall
 * back to the plain template summary - the app must work with zero external AI configuration.
 *
 * Deliberately avoids importing Jackson classes directly (ObjectMapper/JsonNode) - RestTemplate
 * is asked to deserialize straight into a java.util.Map, which Spring's own JSON message
 * converter handles internally without us needing jackson-databind on our compile classpath.
 */
@Component
public class GeminiClient {

    @Value("${app.ai.gemini-api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini-model:gemini-2.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    public String narrativizeOrFallback(String templateSummary) {
        if (!isConfigured()) {
            return templateSummary;
        }
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            String prompt = "Rewrite this music library stats summary as a friendly, concise "
                    + "2-3 sentence insight for the user. Keep every fact accurate, do not "
                    + "invent numbers or details that aren't in the input. Stats: " + templateSummary;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response == null) return templateSummary;

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return templateSummary;

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) return templateSummary;

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return templateSummary;

            Object text = parts.get(0).get("text");
            if (text instanceof String s && !s.isBlank()) {
                return s.trim();
            }
        } catch (Exception ignored) {
            // Fall through to template summary below - the AI feature must never break
            // the request just because the upstream LLM call failed or rate-limited.
        }
        return templateSummary;
    }
}
