package com.musiccatalog.dto;

import com.musiccatalog.entity.LibraryItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryItemResponse {
    private Long id;
    private Long appleCatalogId;
    private String title;
    private String artistName;
    private String genre;
    private LocalDate releaseDate;
    private Integer durationMillis;
    private String artworkUrl;
    private Integer userRating;
    private String userNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LibraryItemResponse from(LibraryItem item) {
        return new LibraryItemResponse(
                item.getId(),
                item.getAppleCatalogId(),
                item.getTitle(),
                item.getArtistName(),
                item.getGenre(),
                item.getReleaseDate(),
                item.getDurationMillis(),
                item.getArtworkUrl(),
                item.getUserRating(),
                item.getUserNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
