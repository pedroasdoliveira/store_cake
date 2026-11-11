package com.pit.cupcakestore.config;

import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.ProductRepository;
import com.pit.cupcakestore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    static final String ADMIN_EMAIL = "admin@doceninho.com";
    static final String ADMIN_PASSWORD = "admin123";

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            ProductRepository productRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        if (productRepository.count() > 0) {
            return;
        }

        productRepository.saveAll(List.of(
                new Product(
                        "Red Velvet",
                        "Massa aveludada com cream cheese e toque de cacau.",
                        new BigDecimal("12.90"),
                        "https://images.unsplash.com/photo-1614707267537-b85aaf00c2b5?auto=format&fit=crop&w=800&q=80",
                        "Clássicos"
                ),
                new Product(
                        "Chocolate Belga",
                        "Cupcake intenso de chocolate com ganache e raspas.",
                        new BigDecimal("13.50"),
                        "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
                        "Chocolate"
                ),
                new Product(
                        "Baunilha com Morango",
                        "Massa de baunilha, recheio de morango e chantilly.",
                        new BigDecimal("11.90"),
                        "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80",
                        "Frutas"
                ),
                new Product(
                        "Limão Siciliano",
                        "Massa cítrica com cobertura de merengue italiano.",
                        new BigDecimal("12.50"),
                        "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=800&q=80",
                        "Frutas"
                ),
                new Product(
                        "Doce de Leite",
                        "Cupcake caramelizado com doce de leite cremoso.",
                        new BigDecimal("12.00"),
                        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
                        "Clássicos"
                ),
                new Product(
                        "Brigadeiro Gourmet",
                        "Massa de chocolate, brigadeiro e granulado belga.",
                        new BigDecimal("10.90"),
                        "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
                        "Chocolate"
                )
        ));
    }

    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase(ADMIN_EMAIL)) {
            return;
        }
        User admin = new User();
        admin.setName("Administrador");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole("ADMIN");
        userRepository.save(admin);
    }
}
