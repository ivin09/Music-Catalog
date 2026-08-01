package com.musiccatalog.service;

import com.musiccatalog.dto.ItunesSearchResponse;
import com.musiccatalog.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Set;

@Service
public class ItunesService {

    private static final Logger log = LoggerFactory.getLogger(ItunesService.class);

    private final RestTemplate restTemplate;

    @Value("${app.itunes.base-url:https://itunes.apple.com}")
    private String baseUrl;

    private static final Set<String> ALLOWED_TYPES = Set.of("song", "album", "musicArtist");

    public ItunesService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ItunesSearchResponse search(String term, String type, int limit) {
        if (term == null || term.isBlank()) {
            throw new BadRequestException("query parameter is required");
        }
        String entity = mapType(type);
        int safeLimit = Math.max(1, Math.min(limit, 50));

        URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/search")
                .queryParam("term", term)
                .queryParam("entity", entity)
                .queryParam("limit", safeLimit)
                .queryParam("media", "music")
                .build()
                .encode()
                .toUri();

        ItunesSearchResponse response;
        try {
            response = restTemplate.getForObject(uri, ItunesSearchResponse.class);
        } catch (RestClientException e) {
            log.error("iTunes Search API call failed for uri={}", uri, e);
            throw new BadRequestException(
                    "Could not reach the iTunes Search API (" + e.getClass().getSimpleName()
                            + "). This is usually a network/firewall issue on this machine, not a code bug.");
        }
        if (response == null) {
            throw new BadRequestException("Could not reach iTunes Search API");
        }
        return response;
    }

    private String mapType(String type) {
        if (type == null || type.isBlank()) {
            return "song";
        }
        if (!ALLOWED_TYPES.contains(type)) {
            throw new BadRequestException("type must be one of: song, album, musicArtist");
        }
        return type;
    }
}