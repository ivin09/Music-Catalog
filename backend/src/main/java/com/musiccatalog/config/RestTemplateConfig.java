package com.musiccatalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {

        RestTemplate restTemplate = new RestTemplate();

        for (HttpMessageConverter<?> converter : restTemplate.getMessageConverters()) {

            if (converter instanceof JacksonJsonHttpMessageConverter jsonConverter) {

                List<MediaType> supportedTypes =
                        new ArrayList<>(jsonConverter.getSupportedMediaTypes());

                supportedTypes.add(MediaType.valueOf("text/javascript"));

                jsonConverter.setSupportedMediaTypes(supportedTypes);

                break;
            }
        }

        return restTemplate;
    }
}