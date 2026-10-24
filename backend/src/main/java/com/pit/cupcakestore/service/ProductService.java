package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.ProductResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAll(String category) {
        if (category == null || category.isBlank() || "todos".equalsIgnoreCase(category)) {
            return productRepository.findAll().stream().map(ProductResponse::from).toList();
        }
        return productRepository.findByCategoryIgnoreCase(category).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new BusinessException("Produto não encontrado."));
    }
}
