package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.AuthResponse;
import com.pit.cupcakestore.dto.LoginRequest;
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

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        User saved = userRepository.save(user);
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), "Cadastro realizado com sucesso.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("E-mail ou senha inválidos.");
        }

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), "Login realizado com sucesso.");
    }
}
