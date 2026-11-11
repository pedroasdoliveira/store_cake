package com.pit.cupcakestore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StoreSettingsRequest {

    @NotBlank(message = "Nome da loja é obrigatório")
    @Size(max = 120)
    private String storeName;

    @NotBlank(message = "Título da página inicial é obrigatório")
    @Size(max = 160)
    private String headline;

    @NotBlank(message = "Descrição da loja é obrigatória")
    private String description;

    @NotBlank(message = "Telefone é obrigatório")
    @Size(max = 40)
    private String phone;

    @NotBlank(message = "E-mail de contato é obrigatório")
    @Email(message = "E-mail de contato inválido")
    private String contactEmail;

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
}
