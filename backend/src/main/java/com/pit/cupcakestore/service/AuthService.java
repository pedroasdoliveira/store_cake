package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.AuthResponse;
import com.pit.cupcakestore.dto.LoginRequest;
import com.pit.cupcakestore.dto.RegisterAdminRequest;
import com.pit.cupcakestore.dto.RegisterRequest;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAccess adminAccess;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AdminAccess adminAccess) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminAccess = adminAccess;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Já existe uma conta com este e-mail.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");

        User saved = userRepository.save(user);
        return toResponse(saved, "Cadastro realizado com sucesso.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("E-mail ou senha inválidos.");
        }

        return toResponse(user, "Login realizado com sucesso.");
    }

    @Transactional
    public AuthResponse registerAdmin(RegisterAdminRequest request) {
        adminAccess.require(request.getAdminUserId());
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Já existe uma conta com este e-mail.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");

        User saved = userRepository.save(user);
        return toResponse(saved, "Administrador cadastrado com sucesso.");
    }

    private AuthResponse toResponse(User user, String message) {
        String role = user.getRole() == null || user.getRole().isBlank() ? "CUSTOMER" : user.getRole();
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), role, message);
    }
}
