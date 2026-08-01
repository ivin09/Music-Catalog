package com.musiccatalog.service;

import com.musiccatalog.dto.LibraryItemRequest;
import com.musiccatalog.dto.LibraryItemUpdateRequest;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.exception.ConflictException;
import com.musiccatalog.exception.NotFoundException;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryItemRepository libraryItemRepository;

    public List<LibraryItem> getLibrary(User user) {
        return libraryItemRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public LibraryItem addToLibrary(User user, LibraryItemRequest request) {
        if (libraryItemRepository.existsByUserAndAppleCatalogId(user, request.getAppleCatalogId())) {
            throw new ConflictException("This item is already in your library");
        }
        LibraryItem item = new LibraryItem();
        item.setUser(user);
        item.setAppleCatalogId(request.getAppleCatalogId());
        item.setTitle(request.getTitle());
        item.setArtistName(request.getArtistName());
        item.setGenre(request.getGenre());
        item.setReleaseDate(request.getReleaseDate());
        item.setDurationMillis(request.getDurationMillis());
        item.setArtworkUrl(request.getArtworkUrl());
        item.setUserRating(request.getUserRating());
        item.setUserNotes(request.getUserNotes());
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return libraryItemRepository.save(item);
    }

    public LibraryItem updateLibraryItem(User user, Long id, LibraryItemUpdateRequest request) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Library item not found"));
        if (request.getUserRating() != null) {
            item.setUserRating(request.getUserRating());
        }
        if (request.getUserNotes() != null) {
            item.setUserNotes(request.getUserNotes());
        }
        return libraryItemRepository.save(item);
    }

    public void deleteLibraryItem(User user, Long id) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Library item not found"));
        libraryItemRepository.delete(item);
    }
}
