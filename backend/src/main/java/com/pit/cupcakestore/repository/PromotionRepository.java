package com.pit.cupcakestore.repository;

import com.pit.cupcakestore.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByActiveTrueOrderByIdDesc();
}
