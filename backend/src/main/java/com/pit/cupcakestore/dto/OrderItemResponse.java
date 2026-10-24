package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.OrderItem;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public static OrderItemResponse from(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.productId = item.getProduct().getId();
        response.productName = item.getProduct().getName();
        response.quantity = item.getQuantity();
        response.unitPrice = item.getUnitPrice();
        response.subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return response;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}
