package com.pit.cupcakestore.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class PromotionRequest {

    @NotBlank(message = "Título da promoção é obrigatório")
    @Size(max = 120)
    private String title;

    @NotBlank(message = "Descrição da promoção é obrigatória")
    private String description;

    @NotNull(message = "Desconto da promoção é obrigatório")
    @DecimalMin(value = "1.00", message = "O desconto da promoção deve ficar entre 1 e 90")
    @DecimalMax(value = "90.00", message = "O desconto da promoção deve ficar entre 1 e 90")
    private BigDecimal discountPercent;

    @NotNull(message = "Informe se a promoção está ativa")
    private Boolean active;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
