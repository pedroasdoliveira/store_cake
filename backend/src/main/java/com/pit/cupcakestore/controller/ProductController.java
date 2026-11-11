package com.pit.cupcakestore.controller;

import com.pit.cupcakestore.dto.ProductResponse;
import com.pit.cupcakestore.dto.SaveProductRequest;
import com.pit.cupcakestore.service.ProductService;
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
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> list(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(productService.listAll(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestParam Long adminUserId,
            @Valid @RequestBody SaveProductRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(adminUserId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestParam Long adminUserId,
            @Valid @RequestBody SaveProductRequest request
    ) {
        return ResponseEntity.ok(productService.update(adminUserId, id, request));
    }
}
