package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.Category;

public class CategoryResponse {

    private Long id;
    private String name;
    private String description;

    public static CategoryResponse from(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.id = category.getId();
        response.name = category.getName();
        response.description = category.getDescription();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }
}
