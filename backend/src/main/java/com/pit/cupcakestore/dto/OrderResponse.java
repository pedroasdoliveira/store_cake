package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String city;
    private String state;
    private String zipCode;
    private String paymentMethod;
    private String status;
    private BigDecimal total;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order order) {
        OrderResponse response = new OrderResponse();
        response.id = order.getId();
        response.userId = order.getUser().getId();
        response.street = order.getStreet();
        response.number = order.getNumber();
        response.complement = order.getComplement();
        response.neighborhood = order.getNeighborhood();
        response.city = order.getCity();
        response.state = order.getState();
        response.zipCode = order.getZipCode();
        response.paymentMethod = order.getPaymentMethod();
        response.status = order.getStatus();
        response.total = order.getTotal();
        response.createdAt = order.getCreatedAt();
        response.items = order.getItems().stream().map(OrderItemResponse::from).toList();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getStreet() {
        return street;
    }

    public String getNumber() {
        return number;
    }

    public String getComplement() {
        return complement;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
