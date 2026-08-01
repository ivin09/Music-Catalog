package com.musiccatalog.controller;

import com.musiccatalog.config.CurrentUserProvider;
import com.musiccatalog.dto.LibraryItemRequest;
import com.musiccatalog.dto.LibraryItemResponse;
import com.musiccatalog.dto.LibraryItemUpdateRequest;
import com.musiccatalog.entity.User;
import com.musiccatalog.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<LibraryItemResponse>> getLibrary(Authentication authentication) {
        User user = currentUserProvider.resolve(authentication);
        List<LibraryItemResponse> items = libraryService.getLibrary(user).stream()
                .map(LibraryItemResponse::from)
                .toList();
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> addToLibrary(Authentication authentication,
                                                              @Valid @RequestBody LibraryItemRequest request) {
        User user = currentUserProvider.resolve(authentication);
        LibraryItemResponse response = LibraryItemResponse.from(libraryService.addToLibrary(user, request));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryItemResponse> updateLibraryItem(Authentication authentication,
                                                                   @PathVariable Long id,
                                                                   @Valid @RequestBody LibraryItemUpdateRequest request) {
        User user = currentUserProvider.resolve(authentication);
        LibraryItemResponse response = LibraryItemResponse.from(libraryService.updateLibraryItem(user, id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLibraryItem(Authentication authentication, @PathVariable Long id) {
        User user = currentUserProvider.resolve(authentication);
        libraryService.deleteLibraryItem(user, id);
        return ResponseEntity.noContent().build();
    }
}
