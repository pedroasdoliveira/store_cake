package com.pit.cupcakestore.controller;

import com.pit.cupcakestore.dto.StoreSettingsRequest;
import com.pit.cupcakestore.dto.StoreSettingsResponse;
import com.pit.cupcakestore.service.StoreSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    public StoreSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping("/api/store")
    public ResponseEntity<StoreSettingsResponse> get() {
        return ResponseEntity.ok(storeSettingsService.get());
    }

    @PutMapping("/api/admin/store")
    public ResponseEntity<StoreSettingsResponse> update(
            @RequestParam Long adminUserId,
            @Valid @RequestBody StoreSettingsRequest request
    ) {
        return ResponseEntity.ok(storeSettingsService.update(adminUserId, request));
    }
}
