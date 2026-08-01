package com.musiccatalog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "library_item", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "apple_catalog_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "apple_catalog_id", nullable = false)
    private Long appleCatalogId;

    @Column(nullable = false)
    private String title;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    private String genre;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    // duration of the track in milliseconds (entity focus = Songs)
    @Column(name = "duration_millis")
    private Integer durationMillis;

    @Column(name = "artwork_url")
    private String artworkUrl;

    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_notes", length = 2000)
    private String userNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
