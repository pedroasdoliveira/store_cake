package com.pit.cupcakestore.controller;

import com.pit.cupcakestore.dto.PromotionRequest;
import com.pit.cupcakestore.dto.PromotionResponse;
import com.pit.cupcakestore.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/api/promotions")
    public ResponseEntity<List<PromotionResponse>> listActive() {
        return ResponseEntity.ok(promotionService.listActive());
    }

    @GetMapping("/api/admin/promotions")
    public ResponseEntity<List<PromotionResponse>> listAll(@RequestParam Long adminUserId) {
        return ResponseEntity.ok(promotionService.listAll(adminUserId));
    }

    @PostMapping("/api/admin/promotions")
    public ResponseEntity<PromotionResponse> create(
            @RequestParam Long adminUserId,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.create(adminUserId, request));
    }

    @PutMapping("/api/admin/promotions/{id}")
    public ResponseEntity<PromotionResponse> update(
            @PathVariable Long id,
            @RequestParam Long adminUserId,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ResponseEntity.ok(promotionService.update(adminUserId, id, request));
    }
}
