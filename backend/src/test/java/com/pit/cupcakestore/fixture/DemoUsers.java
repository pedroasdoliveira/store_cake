package com.pit.cupcakestore.fixture;

import com.pit.cupcakestore.config.DemoAccounts;
import com.pit.cupcakestore.model.User;

public final class DemoUsers {

    private DemoUsers() {
    }

    public static User admin() {
        return user(DemoAccounts.ADMIN, 1L);
    }

    public static User ana() {
        return user(DemoAccounts.ANA, 2L);
    }

    public static User bruno() {
        return user(DemoAccounts.BRUNO, 3L);
    }

    public static User clara() {
        return user(DemoAccounts.CLARA, 4L);
    }

    public static User user(DemoAccounts.Account account, Long id) {
        User user = new User();
        user.setId(id);
        user.setName(account.getName());
        user.setEmail(account.getEmail());
        user.setPassword("hash");
        user.setRole(account.getRole());
        return user;
    }
}
