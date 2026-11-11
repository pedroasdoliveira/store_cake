package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.ProductResponse;
import com.pit.cupcakestore.dto.SaveProductRequest;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Category;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.repository.CategoryRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AdminAccess adminAccess;

    @InjectMocks
    private ProductService productService;

    @Test
    void listAllShouldReturnMappedProducts() {
        Product product = cupcake();
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<ProductResponse> result = productService.listAll(null);

        assertEquals(1, result.size());
        assertEquals("Red Velvet", result.get(0).getName());
        verify(productRepository).findAll();
    }

    @Test
    void listAllShouldFilterByCategory() {
        when(productRepository.findByCategoryIgnoreCase("Chocolate")).thenReturn(List.of(cupcake()));

        List<ProductResponse> result = productService.listAll("Chocolate");

        assertEquals(1, result.size());
        verify(productRepository).findByCategoryIgnoreCase("Chocolate");
    }

    @Test
    void createShouldSaveDiscountInsideAnExistingCatalog() {
        when(categoryRepository.findByNameIgnoreCase("Frutas")).thenReturn(Optional.of(category("Frutas")));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(9L);
            return product;
        });

        ProductResponse response = productService.create(1L, productRequest());

        assertEquals("Limão", response.getName());
        assertEquals("Frutas", response.getCategory());
        assertEquals(new BigDecimal("10.00"), response.getDiscountPercent());
        assertEquals(new BigDecimal("11.61"), response.getSalePrice());
        verify(adminAccess).require(1L);
    }

    @Test
    void updateShouldChangeTitlePhotoAndPrice() {
        Product current = cupcake();
        when(productRepository.findById(1L)).thenReturn(Optional.of(current));
        when(categoryRepository.findByNameIgnoreCase("Chocolate")).thenReturn(Optional.of(category("Chocolate")));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaveProductRequest request = productRequest();
        request.setName("Chocolate Belga");
        request.setCategory("Chocolate");
        request.setImageUrl("https://img.example/novo.jpg");
        request.setPrice(new BigDecimal("15.00"));
        request.setDiscountPercent(BigDecimal.ZERO);

        ProductResponse response = productService.update(1L, 1L, request);

        assertEquals("Chocolate Belga", response.getName());
        assertEquals("https://img.example/novo.jpg", response.getImageUrl());
        assertEquals(new BigDecimal("15.00"), response.getSalePrice());
    }

    @Test
    void createShouldRejectUnknownCatalog() {
        when(categoryRepository.findByNameIgnoreCase("Frutas")).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> productService.create(1L, productRequest()));
        verify(productRepository, never()).save(any());
    }

    @Test
    void createShouldRejectCustomer() {
        when(adminAccess.require(7L)).thenThrow(new BusinessException("Apenas um administrador pode fazer esta ação."));

        assertThrows(BusinessException.class, () -> productService.create(7L, productRequest()));
        verify(productRepository, never()).save(any());
    }

    @Test
    void findByIdShouldThrowWhenMissing() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> productService.findById(99L));
    }

    private Product cupcake() {
        Product product = new Product(
                "Red Velvet",
                "Clássico",
                new BigDecimal("12.90"),
                "https://img.example/red-velvet.jpg",
                "Clássicos"
        );
        product.setId(1L);
        return product;
    }

    private Category category(String name) {
        Category category = new Category();
        category.setId(3L);
        category.setName(name);
        return category;
    }

    private SaveProductRequest productRequest() {
        SaveProductRequest request = new SaveProductRequest();
        request.setName("Limão");
        request.setDescription("Massa cítrica.");
        request.setPrice(new BigDecimal("12.90"));
        request.setImageUrl("https://img.example/limao.jpg");
        request.setCategory("Frutas");
        request.setDiscountPercent(new BigDecimal("10.00"));
        return request;
    }
}
