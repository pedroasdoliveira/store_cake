package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.Product;

import java.math.BigDecimal;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String category;
    private BigDecimal discountPercent;
    private BigDecimal salePrice;

    public static ProductResponse from(Product product) {
        ProductResponse response = new ProductResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.description = product.getDescription();
        response.price = product.getPrice();
        response.imageUrl = product.getImageUrl();
        response.category = product.getCategory();
        response.discountPercent = product.getDiscountPercent() == null ? BigDecimal.ZERO : product.getDiscountPercent();
        response.salePrice = product.salePrice();
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

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }
}
