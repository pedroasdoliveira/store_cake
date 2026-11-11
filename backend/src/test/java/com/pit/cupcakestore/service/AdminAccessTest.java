package com.pit.cupcakestore.service;

import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAccessTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminAccess adminAccess;

    @Test
    void requireShouldReturnTheAdministrator() {
        User admin = new User();
        admin.setId(1L);
        admin.setRole("ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        assertEquals(1L, adminAccess.require(1L).getId());
    }

    @Test
    void requireShouldRejectCustomer() {
        User customer = new User();
        customer.setRole("CUSTOMER");
        when(userRepository.findById(7L)).thenReturn(Optional.of(customer));

        assertThrows(BusinessException.class, () -> adminAccess.require(7L));
    }

    @Test
    void requireShouldRejectMissingUser() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> adminAccess.require(9L));
    }
}
