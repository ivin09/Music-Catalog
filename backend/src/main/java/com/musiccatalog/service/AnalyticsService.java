package com.musiccatalog.service;

import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LibraryItemRepository libraryItemRepository;

    public Map<String, Object> buildAnalytics(User user) {
        List<LibraryItem> items = libraryItemRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalItems", items.size());
        result.put("genreDistribution", genreDistribution(items));
        result.put("releasesByYear", releasesByYear(items));
        result.put("durationHistogram", durationHistogramSeconds(items));
        result.put("topArtists", topArtists(items, 10));
        result.put("ratingDistribution", ratingDistribution(items));
        result.put("averageRating", averageRating(items));

        return result;
    }

    // Pie / donut chart data
    private List<Map<String, Object>> genreDistribution(List<LibraryItem> items) {
        Map<String, Long> counts = items.stream()
                .map(i -> Optional.ofNullable(i.getGenre()).filter(g -> !g.isBlank()).orElse("Unknown"))
                .collect(Collectors.groupingBy(g -> g, LinkedHashMap::new, Collectors.counting()));

        return counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(e -> Map.<String, Object>of("genre", e.getKey(), "count", e.getValue()))
                .toList();
    }

    // Line / bar chart data - releases grouped by year
    private List<Map<String, Object>> releasesByYear(List<LibraryItem> items) {
        Map<Integer, Long> counts = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(i -> i.getReleaseDate().getYear(), TreeMap::new, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> Map.<String, Object>of("year", e.getKey(), "count", e.getValue()))
                .toList();
    }

    // Histogram - track duration buckets (in seconds)
    private List<Map<String, Object>> durationHistogramSeconds(List<LibraryItem> items) {
        int bucketSizeSec = 30;
        Map<Integer, Long> buckets = new TreeMap<>();

        for (LibraryItem item : items) {
            if (item.getDurationMillis() == null) continue;
            int seconds = item.getDurationMillis() / 1000;
            int bucketStart = (seconds / bucketSizeSec) * bucketSizeSec;
            buckets.merge(bucketStart, 1L, Long::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Integer, Long> e : buckets.entrySet()) {
            String label = e.getKey() + "-" + (e.getKey() + bucketSizeSec) + "s";
            result.add(Map.of("bucket", label, "count", e.getValue()));
        }
        return result;
    }

    // Horizontal bar chart data - most-saved artists
    private List<Map<String, Object>> topArtists(List<LibraryItem> items, int limit) {
        Map<String, Long> counts = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, LinkedHashMap::new, Collectors.counting()));

        return counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(e -> Map.<String, Object>of("artist", e.getKey(), "count", e.getValue()))
                .toList();
    }

    // Bar chart data - distribution of user ratings 1-5
    private List<Map<String, Object>> ratingDistribution(List<LibraryItem> items) {
        Map<Integer, Long> counts = new TreeMap<>();
        for (int i = 1; i <= 5; i++) counts.put(i, 0L);
        for (LibraryItem item : items) {
            if (item.getUserRating() != null) {
                counts.merge(item.getUserRating(), 1L, Long::sum);
            }
        }
        return counts.entrySet().stream()
                .map(e -> Map.<String, Object>of("rating", e.getKey(), "count", e.getValue()))
                .toList();
    }

    private Double averageRating(List<LibraryItem> items) {
        List<Integer> rated = items.stream().map(LibraryItem::getUserRating).filter(Objects::nonNull).toList();
        if (rated.isEmpty()) return null;
        return rated.stream().mapToInt(Integer::intValue).average().orElse(0);
    }
}
