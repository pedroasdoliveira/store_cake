package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.ProductResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Product;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

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
}
