package com.pit.cupcakestore.config;

import java.util.List;

public final class DemoAccounts {

    public static final Account ADMIN = account("Administrador", "admin@doceninho.com", "admin123", "ADMIN");
    public static final Account ANA = account("Ana Cupcake", "ana@loja.com", "cliente123", "CUSTOMER");
    public static final Account BRUNO = account("Bruno Ninho", "bruno@loja.com", "cliente123", "CUSTOMER");
    public static final Account CLARA = account("Clara Doce", "clara@loja.com", "cliente123", "CUSTOMER");

    private DemoAccounts() {
    }

    public static List<Account> customers() {
        return List.of(ANA, BRUNO, CLARA);
    }

    public static List<Account> all() {
        return List.of(ADMIN, ANA, BRUNO, CLARA);
    }

    private static Account account(String name, String email, String password, String role) {
        return new Account(name, email, password, role);
    }

    public static final class Account {

        private final String name;
        private final String email;
        private final String password;
        private final String role;

        private Account(String name, String email, String password, String role) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.role = role;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getPassword() {
            return password;
        }

        public String getRole() {
            return role;
        }
    }
}
