package com.pit.cupcakestore.repository;

import com.pit.cupcakestore.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = { "items", "items.product", "user" })
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
