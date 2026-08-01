package com.musiccatalog.service;

import com.musiccatalog.dto.ItunesSearchResponse;
import com.musiccatalog.dto.SearchResultDto;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI feature = "Trend summary + lightweight recommendations". The summary is always computed
 * deterministically from the user's own library stats first (zero external config required).
 * If GEMINI_API_KEY is set, GeminiClient rewrites that same summary into nicer prose - same
 * facts, optional upgrade - with a silent fallback to the template on any failure.
 */
@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final LibraryItemRepository libraryItemRepository;
    private final ItunesService itunesService;
    private final GeminiClient geminiClient;

    public Map<String, Object> buildInsights(User user) {
        List<LibraryItem> items = libraryItemRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, Object> result = new LinkedHashMap<>();

        if (items.isEmpty()) {
            result.put("summary", "Your library is empty. Save a few songs to unlock trend insights and recommendations.");
            result.put("recommendations", List.of());
            return result;
        }

        String topGenre = topEntry(items.stream().collect(Collectors.groupingBy(
                i -> Optional.ofNullable(i.getGenre()).orElse("Unknown"), Collectors.counting())));
        String topArtist = topEntry(items.stream().collect(Collectors.groupingBy(
                LibraryItem::getArtistName, Collectors.counting())));

        String templateSummary = buildTemplateSummary(items, topGenre, topArtist);
        result.put("summary", geminiClient.narrativizeOrFallback(templateSummary));
        result.put("recommendations", buildRecommendations(items, topArtist, topGenre));
        return result;
    }

    private String buildTemplateSummary(List<LibraryItem> items, String topGenre, String topArtist) {
        long ratedCount = items.stream().filter(i -> i.getUserRating() != null).count();
        double avgRating = items.stream().filter(i -> i.getUserRating() != null)
                .mapToInt(LibraryItem::getUserRating).average().orElse(0);

        StringBuilder sb = new StringBuilder();
        sb.append("Your library has ").append(items.size()).append(" saved track")
                .append(items.size() == 1 ? "" : "s").append(". ");
        sb.append("Your most-saved genre is ").append(topGenre).append(", and your most-saved artist is ")
                .append(topArtist).append(". ");
        if (ratedCount > 0) {
            sb.append(String.format("You've rated %d track%s, averaging %.1f/5. ", ratedCount, ratedCount == 1 ? "" : "s", avgRating));
        } else {
            sb.append("You haven't rated any tracks yet - add ratings to sharpen future recommendations. ");
        }
        long recentDecadeCount = items.stream()
                .filter(i -> i.getReleaseDate() != null && i.getReleaseDate().getYear() >= 2015)
                .count();
        if (recentDecadeCount * 2 > items.size()) {
            sb.append("You lean toward newer releases (2015+).");
        } else {
            sb.append("Your taste spans a wide range of eras.");
        }
        return sb.toString();
    }

    // Content-based recommendation: search iTunes for more tracks by the user's top artist and
    // top genre, filtering out anything already saved.
    private List<Map<String, Object>> buildRecommendations(List<LibraryItem> items, String topArtist, String topGenre) {
        Set<Long> alreadySaved = items.stream().map(LibraryItem::getAppleCatalogId).collect(Collectors.toSet());
        List<Map<String, Object>> recs = new ArrayList<>();

        try {
            ItunesSearchResponse byArtist = itunesService.search(topArtist, "song", 15);
            for (SearchResultDto r : byArtist.getResults()) {
                if (r.getTrackId() == null || alreadySaved.contains(r.getTrackId())) continue;
                recs.add(toRecMap(r, "Because you like " + topArtist));
                if (recs.size() >= 5) break;
            }
        } catch (Exception ignored) {
            // Recommendations are best-effort; a flaky upstream call shouldn't break insights.
        }

        if (recs.size() < 8 && !"Unknown".equals(topGenre)) {
            try {
                ItunesSearchResponse byGenre = itunesService.search(topGenre, "song", 15);
                for (SearchResultDto r : byGenre.getResults()) {
                    if (r.getTrackId() == null || alreadySaved.contains(r.getTrackId())) continue;
                    if (recs.stream().anyMatch(m -> m.get("appleCatalogId").equals(r.getTrackId()))) continue;
                    recs.add(toRecMap(r, "Popular in " + topGenre));
                    if (recs.size() >= 8) break;
                }
            } catch (Exception ignored) {
            }
        }

        return recs;
    }

    private Map<String, Object> toRecMap(SearchResultDto r, String reason) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("appleCatalogId", r.getTrackId());
        m.put("title", r.getTrackName());
        m.put("artistName", r.getArtistName());
        m.put("artworkUrl", r.getArtworkUrl100());
        m.put("reason", reason);
        return m;
    }

    private String topEntry(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");
    }
}
