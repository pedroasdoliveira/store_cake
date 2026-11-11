package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.AuthResponse;
import com.pit.cupcakestore.dto.LoginRequest;
import com.pit.cupcakestore.dto.RegisterAdminRequest;
import com.pit.cupcakestore.dto.RegisterRequest;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AdminAccess adminAccess;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Ana Cupcake");
        registerRequest.setEmail("ana@loja.com");
        registerRequest.setPassword("senha123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("ana@loja.com");
        loginRequest.setPassword("senha123");
    }

    @Test
    void registerShouldPersistHashedPassword() {
        when(userRepository.existsByEmailIgnoreCase("ana@loja.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        AuthResponse response = authService.register(registerRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("hash", captor.getValue().getPassword());
        assertEquals("CUSTOMER", captor.getValue().getRole());
        assertEquals("ana@loja.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("Cadastro realizado com sucesso.", response.getMessage());
    }

    @Test
    void registerShouldRejectDuplicatedEmail() {
        when(userRepository.existsByEmailIgnoreCase("ana@loja.com")).thenReturn(true);

        assertThrows(BusinessException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginShouldSucceedWithValidCredentials() {
        User user = new User();
        user.setId(7L);
        user.setName("Ana Cupcake");
        user.setEmail("ana@loja.com");
        user.setPassword("hash");
        user.setRole("ADMIN");

        when(userRepository.findByEmailIgnoreCase("ana@loja.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha123", "hash")).thenReturn(true);

        AuthResponse response = authService.login(loginRequest);

        assertEquals(7L, response.getUserId());
        assertEquals("ADMIN", response.getRole());
        assertEquals("Login realizado com sucesso.", response.getMessage());
    }

    @Test
    void loginShouldFailWithWrongPassword() {
        User user = new User();
        user.setPassword("hash");
        when(userRepository.findByEmailIgnoreCase("ana@loja.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha123", "hash")).thenReturn(false);

        assertThrows(BusinessException.class, () -> authService.login(loginRequest));
    }

    @Test
    void registerAdminShouldPersistAnotherAdministrator() {
        RegisterAdminRequest request = adminRequest();
        when(passwordEncoder.encode("senha123")).thenReturn("hash");
        when(userRepository.existsByEmailIgnoreCase("novo@doceninho.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(8L);
            return user;
        });

        AuthResponse response = authService.registerAdmin(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("ADMIN", captor.getValue().getRole());
        assertEquals("hash", captor.getValue().getPassword());
        assertEquals("ADMIN", response.getRole());
        assertEquals("Administrador cadastrado com sucesso.", response.getMessage());
        verify(adminAccess).require(1L);
    }

    @Test
    void registerAdminShouldRejectDuplicatedEmail() {
        when(userRepository.existsByEmailIgnoreCase("novo@doceninho.com")).thenReturn(true);

        assertThrows(BusinessException.class, () -> authService.registerAdmin(adminRequest()));
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerAdminShouldRejectWhenActorIsNotAdmin() {
        when(adminAccess.require(1L)).thenThrow(new BusinessException("Apenas um administrador pode fazer esta ação."));

        assertThrows(BusinessException.class, () -> authService.registerAdmin(adminRequest()));
        verify(userRepository, never()).save(any());
    }

    private RegisterAdminRequest adminRequest() {
        RegisterAdminRequest request = new RegisterAdminRequest();
        request.setAdminUserId(1L);
        request.setName("Novo Admin");
        request.setEmail("novo@doceninho.com");
        request.setPassword("senha123");
        return request;
    }
}
