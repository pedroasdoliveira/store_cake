package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.CreateOrderRequest;
import com.pit.cupcakestore.dto.OrderItemRequest;
import com.pit.cupcakestore.dto.OrderResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Order;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.OrderRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import com.pit.cupcakestore.repository.UserRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void createShouldCalculateTotalFromCatalogPrices() {
        User user = new User();
        user.setId(1L);

        Product product = new Product("Chocolate Belga", "Intenso", new BigDecimal("10.00"), "img", "Chocolate");
        product.setId(3L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(42L);
            return order;
        });

        CreateOrderRequest request = baseRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(3L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        OrderResponse response = orderService.create(request);

        assertEquals(42L, response.getId());
        assertEquals(new BigDecimal("20.00"), response.getTotal());
        assertEquals("CONFIRMED", response.getStatus());
        assertEquals(1, response.getItems().size());
    }

    @Test
    void createShouldFailWhenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> orderService.create(baseRequest()));
    }

    @Test
    void listByUserShouldFailWhenUserMissing() {
        when(userRepository.existsById(9L)).thenReturn(false);

        assertThrows(BusinessException.class, () -> orderService.listByUser(9L));
    }

    private CreateOrderRequest baseRequest() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(1L);
        request.setStreet("Rua das Flores");
        request.setNumber("100");
        request.setNeighborhood("Centro");
        request.setCity("São Paulo");
        request.setState("SP");
        request.setZipCode("01000-000");
        request.setPaymentMethod("PIX");
        request.setItems(List.of());
        return request;
    }
}
