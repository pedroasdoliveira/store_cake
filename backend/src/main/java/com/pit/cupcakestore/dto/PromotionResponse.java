package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.Promotion;

import java.math.BigDecimal;

public class PromotionResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal discountPercent;
    private boolean active;

    public static PromotionResponse from(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.id = promotion.getId();
        response.title = promotion.getTitle();
        response.description = promotion.getDescription();
        response.discountPercent = promotion.getDiscountPercent();
        response.active = promotion.isActive();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public boolean isActive() {
        return active;
    }
}
