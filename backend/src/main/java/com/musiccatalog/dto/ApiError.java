package com.musiccatalog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ApiError {
    private int status;
    private String error;
    private List<String> messages;
    private String path;
    private LocalDateTime timestamp;
}
