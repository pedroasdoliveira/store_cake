package com.pit.cupcakestore.controller;

import com.pit.cupcakestore.dto.OrderResponse;
import com.pit.cupcakestore.dto.UpdateOrderRequest;
import com.pit.cupcakestore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> list(@RequestParam Long adminUserId) {
        return ResponseEntity.ok(orderService.listAll(adminUserId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(
            @PathVariable Long id,
            @RequestParam Long adminUserId,
            @Valid @RequestBody UpdateOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.update(adminUserId, id, request));
    }
}
