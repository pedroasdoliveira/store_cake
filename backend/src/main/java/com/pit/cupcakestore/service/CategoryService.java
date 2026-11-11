package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.CategoryRequest;
import com.pit.cupcakestore.dto.CategoryResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Category;
import com.pit.cupcakestore.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AdminAccess adminAccess;

    public CategoryService(CategoryRepository categoryRepository, AdminAccess adminAccess) {
        this.categoryRepository = categoryRepository;
        this.adminAccess = adminAccess;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse create(Long adminUserId, CategoryRequest request) {
        adminAccess.require(adminUserId);
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Já existe um catálogo com este nome.");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(blankToNull(request.getDescription()));
        return CategoryResponse.from(categoryRepository.save(category));
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
