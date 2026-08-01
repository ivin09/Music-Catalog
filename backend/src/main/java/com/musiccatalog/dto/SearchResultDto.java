package com.musiccatalog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

// Maps the subset of fields we care about from the iTunes Search API "song" result shape
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchResultDto {

    @JsonProperty("trackId")
    private Long trackId;

    @JsonProperty("collectionId")
    private Long collectionId;

    @JsonProperty("artistName")
    private String artistName;

    @JsonProperty("trackName")
    private String trackName;

    @JsonProperty("collectionName")
    private String collectionName;

    @JsonProperty("primaryGenreName")
    private String primaryGenreName;

    @JsonProperty("releaseDate")
    private String releaseDate;

    @JsonProperty("trackTimeMillis")
    private Integer trackTimeMillis;

    @JsonProperty("artworkUrl100")
    private String artworkUrl100;

    @JsonProperty("trackPrice")
    private Double trackPrice;

    @JsonProperty("wrapperType")
    private String wrapperType;

    @JsonProperty("kind")
    private String kind;
}
