package com.musiccatalog.dto;

import lombok.Data;

import java.util.List;

@Data
public class ItunesSearchResponse {
    private int resultCount;
    private List<SearchResultDto> results;
}
