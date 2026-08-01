package com.musiccatalog.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LibraryItemRequest {

    @NotNull(message = "appleCatalogId is required")
    private Long appleCatalogId;

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "artistName is required")
    private String artistName;

    private String genre;

    private LocalDate releaseDate;

    private Integer durationMillis;

    private String artworkUrl;

    @Min(value = 1, message = "userRating must be between 1 and 5")
    @Max(value = 5, message = "userRating must be between 1 and 5")
    private Integer userRating;

    @Size(max = 2000, message = "userNotes must be at most 2000 characters")
    private String userNotes;
}
