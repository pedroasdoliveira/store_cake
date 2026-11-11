package com.pit.cupcakestore.service;

import com.pit.cupcakestore.dto.StoreSettingsRequest;
import com.pit.cupcakestore.dto.StoreSettingsResponse;
import com.pit.cupcakestore.model.StoreSettings;
import com.pit.cupcakestore.repository.StoreSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreSettingsService {

    private final StoreSettingsRepository storeSettingsRepository;
    private final AdminAccess adminAccess;

    public StoreSettingsService(StoreSettingsRepository storeSettingsRepository, AdminAccess adminAccess) {
        this.storeSettingsRepository = storeSettingsRepository;
        this.adminAccess = adminAccess;
    }

    @Transactional(readOnly = true)
    public StoreSettingsResponse get() {
        return storeSettingsRepository.findAll().stream()
                .findFirst()
                .map(StoreSettingsResponse::from)
                .orElseGet(StoreSettingsResponse::defaults);
    }

    @Transactional
    public StoreSettingsResponse update(Long adminUserId, StoreSettingsRequest request) {
        adminAccess.require(adminUserId);
        StoreSettings settings = storeSettingsRepository.findAll().stream().findFirst().orElseGet(StoreSettings::new);
        settings.setStoreName(request.getStoreName().trim());
        settings.setHeadline(request.getHeadline().trim());
        settings.setDescription(request.getDescription().trim());
        settings.setPhone(request.getPhone().trim());
        settings.setContactEmail(request.getContactEmail().trim().toLowerCase());
        return StoreSettingsResponse.from(storeSettingsRepository.save(settings));
    }
}
