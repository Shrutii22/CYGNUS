package com.aura;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    private LocalDateTime createdAt;

    public Contact() {
    }
    public Contact(String name, String phoneNumber) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.createdAt = LocalDateTime.now();
}

public Long getId() {
    return id;
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public String getPhoneNumber() {
    return phoneNumber;
}

public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}
}