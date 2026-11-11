package com.pit.cupcakestore.service;

import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminAccess {

    private final UserRepository userRepository;

    public AdminAccess(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User require(Long adminUserId) {
        if (adminUserId == null) {
            throw new BusinessException("Administrador não informado.");
        }
        User user = userRepository.findById(adminUserId)
                .orElseThrow(() -> new BusinessException("Administrador não encontrado."));
        if (!"ADMIN".equals(user.getRole())) {
            throw new BusinessException("Apenas um administrador pode fazer esta ação.");
        }
        return user;
    }
}
