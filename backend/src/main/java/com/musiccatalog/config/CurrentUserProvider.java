package com.musiccatalog.config;

import com.musiccatalog.entity.User;
import com.musiccatalog.exception.NotFoundException;
import com.musiccatalog.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User resolve(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }
}
