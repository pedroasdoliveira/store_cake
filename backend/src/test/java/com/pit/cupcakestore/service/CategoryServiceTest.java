package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.CategoryRequest;
import com.pit.cupcakestore.dto.CategoryResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Category;
import com.pit.cupcakestore.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AdminAccess adminAccess;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void listShouldReturnCatalogs() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Frutas");
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.list();

        assertEquals("Frutas", result.get(0).getName());
    }

    @Test
    void createShouldPersistANewCatalog() {
        when(categoryRepository.existsByNameIgnoreCase("Especiais")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(4L);
            return category;
        });

        CategoryRequest request = new CategoryRequest();
        request.setName("  Especiais  ");
        request.setDescription("Edições da casa");

        CategoryResponse response = categoryService.create(1L, request);

        assertEquals("Especiais", response.getName());
        assertEquals("Edições da casa", response.getDescription());
        verify(adminAccess).require(1L);
    }

    @Test
    void createShouldRejectDuplicatedName() {
        when(categoryRepository.existsByNameIgnoreCase("Chocolate")).thenReturn(true);
        CategoryRequest request = new CategoryRequest();
        request.setName("Chocolate");

        assertThrows(BusinessException.class, () -> categoryService.create(1L, request));
        verify(categoryRepository, never()).save(any());
    }
}
