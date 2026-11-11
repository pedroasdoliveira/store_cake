package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.PromotionRequest;
import com.pit.cupcakestore.dto.PromotionResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Promotion;
import com.pit.cupcakestore.repository.PromotionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private AdminAccess adminAccess;

    @InjectMocks
    private PromotionService promotionService;

    @Test
    void listActiveShouldIgnorePausedPromotions() {
        when(promotionRepository.findByActiveTrueOrderByIdDesc()).thenReturn(List.of(promotion(true)));

        List<PromotionResponse> result = promotionService.listActive();

        assertEquals(1, result.size());
        assertEquals("Semana do chocolate", result.get(0).getTitle());
    }

    @Test
    void createShouldPersistAnActivePromotion() {
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(invocation -> {
            Promotion promotion = invocation.getArgument(0);
            promotion.setId(4L);
            return promotion;
        });

        PromotionResponse response = promotionService.create(1L, request(true));

        assertEquals(4L, response.getId());
        assertEquals(new BigDecimal("15"), response.getDiscountPercent());
        verify(adminAccess).require(1L);
    }

    @Test
    void updateShouldPauseAPromotion() {
        when(promotionRepository.findById(4L)).thenReturn(Optional.of(promotion(true)));
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PromotionResponse response = promotionService.update(1L, 4L, request(false));

        assertFalse(response.isActive());
    }

    @Test
    void updateShouldFailWhenMissing() {
        when(promotionRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> promotionService.update(1L, 9L, request(true)));
    }

    private Promotion promotion(boolean active) {
        Promotion promotion = new Promotion();
        promotion.setId(4L);
        promotion.setTitle("Semana do chocolate");
        promotion.setDescription("15% em qualquer pedido.");
        promotion.setDiscountPercent(new BigDecimal("15"));
        promotion.setActive(active);
        return promotion;
    }

    private PromotionRequest request(boolean active) {
        PromotionRequest request = new PromotionRequest();
        request.setTitle("Semana do chocolate");
        request.setDescription("15% em qualquer pedido.");
        request.setDiscountPercent(new BigDecimal("15"));
        request.setActive(active);
        return request;
    }
}
