package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.ProductResponse;
import com.pit.cupcakestore.dto.SaveProductRequest;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Category;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.repository.CategoryRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AdminAccess adminAccess;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            AdminAccess adminAccess
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.adminAccess = adminAccess;
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

    @Transactional
    public ProductResponse create(Long adminUserId, SaveProductRequest request) {
        adminAccess.require(adminUserId);
        Product product = new Product();
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long adminUserId, Long id, SaveProductRequest request) {
        adminAccess.require(adminUserId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Produto não encontrado."));
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    private void apply(Product product, SaveProductRequest request) {
        Category category = categoryRepository.findByNameIgnoreCase(request.getCategory().trim())
                .orElseThrow(() -> new BusinessException("Catálogo não encontrado."));
        BigDecimal discount = request.getDiscountPercent();
        if (discount.compareTo(BigDecimal.ZERO) < 0 || discount.compareTo(new BigDecimal("90")) > 0) {
            throw new BusinessException("O desconto deve ficar entre 0 e 90.");
        }
        if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("O preço deve ser maior que zero.");
        }

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl().trim());
        product.setCategory(category.getName());
        product.setDiscountPercent(discount);
    }
}
