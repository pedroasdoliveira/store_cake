package com.pit.cupcakestore.fixture;

import com.pit.cupcakestore.config.DemoAccounts;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DemoUsersTest {

    @Test
    void shouldMirrorTheSeededAdministratorAndCustomers() {
        assertEquals(DemoAccounts.ADMIN.getEmail(), DemoUsers.admin().getEmail());
        assertEquals("ADMIN", DemoUsers.admin().getRole());
        assertEquals(3, DemoAccounts.customers().size());
        assertEquals("CUSTOMER", DemoUsers.ana().getRole());
        assertEquals("CUSTOMER", DemoUsers.bruno().getRole());
        assertEquals("CUSTOMER", DemoUsers.clara().getRole());
        assertEquals(DemoAccounts.BRUNO.getEmail(), DemoUsers.bruno().getEmail());
        assertEquals(DemoAccounts.CLARA.getName(), DemoUsers.clara().getName());
    }
}
