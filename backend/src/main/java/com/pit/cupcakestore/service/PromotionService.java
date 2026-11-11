package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.PromotionRequest;
import com.pit.cupcakestore.dto.PromotionResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Promotion;
import com.pit.cupcakestore.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final AdminAccess adminAccess;

    public PromotionService(PromotionRepository promotionRepository, AdminAccess adminAccess) {
        this.promotionRepository = promotionRepository;
        this.adminAccess = adminAccess;
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> listActive() {
        return promotionRepository.findByActiveTrueOrderByIdDesc().stream()
                .map(PromotionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> listAll(Long adminUserId) {
        adminAccess.require(adminUserId);
        return promotionRepository.findAll().stream().map(PromotionResponse::from).toList();
    }

    @Transactional
    public PromotionResponse create(Long adminUserId, PromotionRequest request) {
        adminAccess.require(adminUserId);
        Promotion promotion = new Promotion();
        apply(promotion, request);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponse update(Long adminUserId, Long id, PromotionRequest request) {
        adminAccess.require(adminUserId);
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Promoção não encontrada."));
        apply(promotion, request);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    private void apply(Promotion promotion, PromotionRequest request) {
        BigDecimal discount = request.getDiscountPercent();
        if (discount.compareTo(BigDecimal.ONE) < 0 || discount.compareTo(new BigDecimal("90")) > 0) {
            throw new BusinessException("O desconto da promoção deve ficar entre 1 e 90.");
        }
        promotion.setTitle(request.getTitle().trim());
        promotion.setDescription(request.getDescription().trim());
        promotion.setDiscountPercent(discount);
        promotion.setActive(Boolean.TRUE.equals(request.getActive()));
    }
}
