package com.musiccatalog.controller;

import com.musiccatalog.dto.ItunesSearchResponse;
import com.musiccatalog.service.ItunesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ItunesService itunesService;

    // GET /api/search?query=...&type=song|album|musicArtist&limit=25
    @GetMapping
    public ResponseEntity<ItunesSearchResponse> search(
            @RequestParam("query") String query,
            @RequestParam(value = "type", required = false, defaultValue = "song") String type,
            @RequestParam(value = "limit", required = false, defaultValue = "25") int limit) {
        return ResponseEntity.ok(itunesService.search(query, type, limit));
    }
}
