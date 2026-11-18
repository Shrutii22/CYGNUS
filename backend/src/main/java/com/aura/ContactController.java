package com.aura;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // Add a new contact
    @PostMapping
    public Contact addContact(@RequestBody ContactRequest request) {

        return contactService.addContact(
                request.name(),
                request.phoneNumber()
        );
    }

    // Get all contacts
    @GetMapping
    public List<Contact> getAllContacts() {

        return contactService.getAllContacts();
    }

    // Get contact by ID
    @GetMapping("/{id}")
    public Contact getContactById(@PathVariable Long id) {

        return contactService.getContactById(id);
    }

    // Delete a contact
    @DeleteMapping("/{id}")
    public void deleteContact(@PathVariable Long id) {

        contactService.deleteContact(id);
    }
    @GetMapping("/search")
public List<Contact> findContactsByName(
        @RequestParam String name) {

    return contactService.findContactsByName(name);
}

    public record ContactRequest(
            String name,
            String phoneNumber
    ) {}
}