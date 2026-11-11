package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.CreateOrderRequest;
import com.pit.cupcakestore.dto.OrderItemRequest;
import com.pit.cupcakestore.dto.OrderResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Order;
import com.pit.cupcakestore.model.OrderItem;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.model.Promotion;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.OrderRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import com.pit.cupcakestore.repository.PromotionRepository;
import com.pit.cupcakestore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PromotionRepository promotionRepository
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado. Faça login novamente."));

        Order order = new Order();
        order.setUser(user);
        order.setStreet(request.getStreet().trim());
        order.setNumber(request.getNumber().trim());
        order.setComplement(request.getComplement());
        order.setNeighborhood(request.getNeighborhood().trim());
        order.setCity(request.getCity().trim());
        order.setState(request.getState().trim().toUpperCase());
        order.setZipCode(request.getZipCode().trim());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("CONFIRMED");

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new BusinessException("Produto não encontrado no catálogo."));

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.salePrice());
            order.addItem(item);

            total = total.add(product.salePrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        order.setSubtotal(total);
        BigDecimal discount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (request.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                    .orElseThrow(() -> new BusinessException("Promoção não encontrada."));
            if (!promotion.isActive()) {
                throw new BusinessException("Esta promoção não está ativa.");
            }
            discount = total.multiply(promotion.getDiscountPercent())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            order.setPromotionTitle(promotion.getTitle());
        }
        order.setDiscountAmount(discount);
        order.setTotal(total.subtract(discount));
        Order saved = orderRepository.save(order);
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException("Usuário não encontrado.");
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }
}
