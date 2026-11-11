package com.pit.cupcakestore.config;

import com.pit.cupcakestore.dto.StoreSettingsResponse;
import com.pit.cupcakestore.model.Category;
import com.pit.cupcakestore.model.Product;
import com.pit.cupcakestore.model.StoreSettings;
import com.pit.cupcakestore.model.User;
import com.pit.cupcakestore.repository.CategoryRepository;
import com.pit.cupcakestore.repository.ProductRepository;
import com.pit.cupcakestore.repository.StoreSettingsRepository;
import com.pit.cupcakestore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final StoreSettingsRepository storeSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            ProductRepository productRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            StoreSettingsRepository storeSettingsRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategories();
        seedStore();
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

    private void seedStore() {
        if (storeSettingsRepository.count() > 0) {
            return;
        }
        StoreSettingsResponse defaults = StoreSettingsResponse.defaults();
        StoreSettings settings = new StoreSettings();
        settings.setStoreName(defaults.getStoreName());
        settings.setHeadline(defaults.getHeadline());
        settings.setDescription(defaults.getDescription());
        settings.setPhone(defaults.getPhone());
        settings.setContactEmail(defaults.getContactEmail());
        storeSettingsRepository.save(settings);
    }

    private void seedCategories() {
        saveCategory("Clássicos", "Receitas de sempre da casa.");
        saveCategory("Chocolate", "Massas e coberturas de cacau.");
        saveCategory("Frutas", "Sabores cítricos e de fruta fresca.");
    }

    private void saveCategory(String name, String description) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            return;
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        categoryRepository.save(category);
    }

    private void seedUsers() {
        for (DemoAccounts.Account account : DemoAccounts.all()) {
            if (userRepository.existsByEmailIgnoreCase(account.getEmail())) {
                continue;
            }
            User user = new User();
            user.setName(account.getName());
            user.setEmail(account.getEmail());
            user.setPassword(passwordEncoder.encode(account.getPassword()));
            user.setRole(account.getRole());
            userRepository.save(user);
        }
    }
}
