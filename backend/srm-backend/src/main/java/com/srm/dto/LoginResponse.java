package com.srm.dto;

public class LoginResponse {

    private String token;
    private String role;
    private String name;
    private String phone;

    public LoginResponse(String token, String role, String name, String phone) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.phone = phone;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}