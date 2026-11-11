package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.StoreSettingsRequest;
import com.pit.cupcakestore.dto.StoreSettingsResponse;
import com.pit.cupcakestore.exception.BusinessException;
import com.pit.cupcakestore.model.StoreSettings;
import com.pit.cupcakestore.repository.StoreSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoreSettingsServiceTest {

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @Mock
    private AdminAccess adminAccess;

    @InjectMocks
    private StoreSettingsService storeSettingsService;

    @Test
    void getShouldReturnDefaultsWhenTheStoreWasNotConfigured() {
        when(storeSettingsRepository.findAll()).thenReturn(List.of());

        StoreSettingsResponse response = storeSettingsService.get();

        assertEquals("Doce Ninho", response.getStoreName());
        assertEquals("Sabores pensados para adoçar o seu dia", response.getHeadline());
    }

    @Test
    void updateShouldPersistTheVirtualStoreSettings() {
        when(storeSettingsRepository.findAll()).thenReturn(List.of());
        when(storeSettingsRepository.save(any(StoreSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StoreSettingsResponse response = storeSettingsService.update(1L, request());

        assertEquals("Ninho Doce", response.getStoreName());
        assertEquals("contato@ninho.com", response.getContactEmail());
        verify(adminAccess).require(1L);
    }

    @Test
    void updateShouldRejectCustomer() {
        when(adminAccess.require(7L)).thenThrow(new BusinessException("Apenas um administrador pode fazer esta ação."));

        assertThrows(BusinessException.class, () -> storeSettingsService.update(7L, request()));
    }

    private StoreSettingsRequest request() {
        StoreSettingsRequest request = new StoreSettingsRequest();
        request.setStoreName("Ninho Doce");
        request.setHeadline("Cupcakes do fim de semana");
        request.setDescription("Encomendas até sábado.");
        request.setPhone("(11) 97777-0000");
        request.setContactEmail("Contato@ninho.com");
        return request;
    }
}
