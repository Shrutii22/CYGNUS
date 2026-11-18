package com.aura;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository
        extends JpaRepository<Contact, Long> {

    List<Contact> findByNameIgnoreCase(String name);
}