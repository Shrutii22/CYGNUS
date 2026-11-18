package com.aura;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public Contact addContact(String name, String phoneNumber) {

        Contact contact = new Contact(name, phoneNumber);

        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {

        return contactRepository.findAll();
    }

    public Contact getContactById(Long id) {

        return contactRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact not found"));
    }

    public void deleteContact(Long id) {

        if (!contactRepository.existsById(id)) {
            throw new RuntimeException("Contact not found");
        }

        contactRepository.deleteById(id);
    }
    public List<Contact> findContactsByName(String name) {

    return contactRepository.findByNameIgnoreCase(name);
}
}