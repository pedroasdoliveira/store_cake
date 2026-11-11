package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.CreateOrderRequest;
import com.pit.cupcakestore.dto.OrderItemRequest;
import com.pit.cupcakestore.dto.OrderResponse;
import com.pit.cupcakestore.dto.UpdateOrderRequest;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.Order;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.model.Promotion;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.OrderRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import com.pit.cupcakestore.repository.PromotionRepository;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private AdminAccess adminAccess;

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
        assertEquals(new BigDecimal("10.00"), response.getItems().get(0).getUnitPrice());
        assertEquals("CONFIRMED", response.getStatus());
        assertEquals(1, response.getItems().size());
        assertEquals("PIX", response.getPaymentMethod());
        assertTrue(response.getTransactionCode().matches("[A-Z2-9]{10}"));
        assertNull(response.getCardLast4());
    }

    @Test
    void createShouldApproveACardAndKeepOnlyTheLastDigits() {
        stubCatalog();
        stubSave();
        CreateOrderRequest request = paidRequest();
        request.setPaymentMethod("cartao");
        request.setCardBrand("Visa");
        request.setCardLast4("1111");

        OrderResponse response = orderService.create(request);

        assertEquals("CARTAO", response.getPaymentMethod());
        assertEquals("Visa", response.getCardBrand());
        assertEquals("1111", response.getCardLast4());
        assertEquals("APROVADO", response.getPaymentStatus());
        assertNotNull(response.getTransactionCode());
    }

    @Test
    void createShouldRefuseACardEndingIn0002() {
        stubCatalog();
        stubSave();
        CreateOrderRequest request = paidRequest();
        request.setPaymentMethod("CARTAO");
        request.setCardBrand("Visa");
        request.setCardLast4("0002");

        OrderResponse response = orderService.create(request);

        assertEquals("RECUSADO", response.getPaymentStatus());
        assertEquals("0002", response.getCardLast4());
    }

    @Test
    void createShouldRecordCashWithoutCardData() {
        stubCatalog();
        stubSave();
        CreateOrderRequest request = paidRequest();
        request.setPaymentMethod("DINHEIRO");

        OrderResponse response = orderService.create(request);

        assertEquals("DINHEIRO", response.getPaymentMethod());
        assertNotNull(response.getTransactionCode());
        assertNull(response.getPaymentStatus());
        assertNull(response.getCardBrand());
    }

    @Test
    void createShouldRejectACardWithoutTheLastDigits() {
        stubCatalog();
        CreateOrderRequest request = paidRequest();
        request.setPaymentMethod("CARTAO");

        assertThrows(BusinessException.class, () -> orderService.create(request));
    }

    @Test
    void createShouldChargeTheDiscountedCatalogPrice() {
        User user = new User();
        user.setId(1L);
        Product product = new Product("Chocolate Belga", "Intenso", new BigDecimal("10.00"), "img", "Chocolate");
        product.setId(3L);
        product.setDiscountPercent(new BigDecimal("10"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateOrderRequest request = baseRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(3L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        OrderResponse response = orderService.create(request);

        assertEquals(new BigDecimal("9.00"), response.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("18.00"), response.getTotal());
    }

    @Test
    void createShouldApplyAnActivePromotionToTheOrder() {
        User user = new User();
        user.setId(1L);
        Product product = new Product("Chocolate Belga", "Intenso", new BigDecimal("10.00"), "img", "Chocolate");
        product.setId(3L);
        Promotion promotion = new Promotion();
        promotion.setId(5L);
        promotion.setTitle("Semana do chocolate");
        promotion.setDiscountPercent(new BigDecimal("10"));
        promotion.setActive(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(promotionRepository.findById(5L)).thenReturn(Optional.of(promotion));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateOrderRequest request = baseRequest();
        request.setPromotionId(5L);
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(3L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        OrderResponse response = orderService.create(request);

        assertEquals(new BigDecimal("20.00"), response.getSubtotal());
        assertEquals(new BigDecimal("2.00"), response.getDiscountAmount());
        assertEquals(new BigDecimal("18.00"), response.getTotal());
        assertEquals("Semana do chocolate", response.getPromotionTitle());
    }

    @Test
    void createShouldRejectInactivePromotion() {
        User user = new User();
        user.setId(1L);
        Product product = new Product("Chocolate Belga", "Intenso", new BigDecimal("10.00"), "img", "Chocolate");
        product.setId(3L);
        Promotion promotion = new Promotion();
        promotion.setActive(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(promotionRepository.findById(5L)).thenReturn(Optional.of(promotion));

        CreateOrderRequest request = baseRequest();
        request.setPromotionId(5L);
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(3L);
        item.setQuantity(1);
        request.setItems(List.of(item));

        assertThrows(BusinessException.class, () -> orderService.create(request));
    }

    @Test
    void createShouldFailWhenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> orderService.create(baseRequest()));
    }

    @Test
    void updateShouldChangeStatusAndDeliveryWithoutChangingTotal() {
        User customer = new User();
        customer.setId(7L);
        customer.setName("Ana Cupcake");
        Order order = new Order();
        order.setId(42L);
        order.setUser(customer);
        order.setTotal(new BigDecimal("20.00"));
        order.setStatus("CONFIRMED");
        when(orderRepository.findById(42L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateOrderRequest request = new UpdateOrderRequest();
        request.setStatus("out_for_delivery");
        request.setStreet("Rua Nova");
        request.setNumber("50");
        request.setNeighborhood("Centro");
        request.setCity("São Paulo");
        request.setState("sp");
        request.setZipCode("01000-000");
        request.setDeliveryNote("Portaria 2");

        OrderResponse response = orderService.update(1L, 42L, request);

        assertEquals("OUT_FOR_DELIVERY", response.getStatus());
        assertEquals("Rua Nova", response.getStreet());
        assertEquals("SP", response.getState());
        assertEquals("Portaria 2", response.getDeliveryNote());
        assertEquals("Ana Cupcake", response.getCustomerName());
        assertEquals(new BigDecimal("20.00"), response.getTotal());
        verify(adminAccess).require(1L);
    }

    @Test
    void updateShouldRejectUnknownStatus() {
        UpdateOrderRequest request = new UpdateOrderRequest();
        request.setStatus("ENVIADO");
        request.setStreet("Rua Nova");
        request.setNumber("50");
        request.setNeighborhood("Centro");
        request.setCity("São Paulo");
        request.setState("SP");
        request.setZipCode("01000-000");

        assertThrows(BusinessException.class, () -> orderService.update(1L, 42L, request));
    }

    @Test
    void listAllShouldRejectCustomer() {
        when(adminAccess.require(7L)).thenThrow(new BusinessException("Apenas um administrador pode fazer esta ação."));

        assertThrows(BusinessException.class, () -> orderService.listAll(7L));
    }

    @Test
    void listByUserShouldFailWhenUserMissing() {
        when(userRepository.existsById(9L)).thenReturn(false);

        assertThrows(BusinessException.class, () -> orderService.listByUser(9L));
    }

    private void stubCatalog() {
        User user = new User();
        user.setId(1L);
        Product product = new Product("Chocolate Belga", "Intenso", new BigDecimal("10.00"), "img", "Chocolate");
        product.setId(3L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
    }

    private void stubSave() {
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private CreateOrderRequest paidRequest() {
        CreateOrderRequest request = baseRequest();
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(3L);
        item.setQuantity(1);
        request.setItems(List.of(item));
        return request;
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
