package com.musiccatalog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

// PUT only allows editing the user's own annotations - the catalog facts are immutable once saved
@Data
public class LibraryItemUpdateRequest {

    @Min(value = 1, message = "userRating must be between 1 and 5")
    @Max(value = 5, message = "userRating must be between 1 and 5")
    private Integer userRating;

    @Size(max = 2000, message = "userNotes must be at most 2000 characters")
    private String userNotes;
}
