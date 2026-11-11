package com.pit.cupcakestore.dto;

import com.pit.cupcakestore.model.StoreSettings;

public class StoreSettingsResponse {

    private String storeName;
    private String headline;
    private String description;
    private String phone;
    private String contactEmail;

    public static StoreSettingsResponse from(StoreSettings settings) {
        StoreSettingsResponse response = new StoreSettingsResponse();
        response.storeName = settings.getStoreName();
        response.headline = settings.getHeadline();
        response.description = settings.getDescription();
        response.phone = settings.getPhone();
        response.contactEmail = settings.getContactEmail();
        return response;
    }

    public static StoreSettingsResponse defaults() {
        StoreSettingsResponse response = new StoreSettingsResponse();
        response.storeName = "Doce Ninho";
        response.headline = "Sabores pensados para adoçar o seu dia";
        response.description = "Escolha um cupcake, monte o carrinho e finalize o pedido com entrega em casa.";
        response.phone = "(11) 98888-0000";
        response.contactEmail = "contato@doceninho.com";
        return response;
    }

    public String getStoreName() {
        return storeName;
    }

    public String getHeadline() {
        return headline;
    }

    public String getDescription() {
        return description;
    }

    public String getPhone() {
        return phone;
    }

    public String getContactEmail() {
        return contactEmail;
    }
}
