package com.cnesten.medarrivalbackend.Security.Repositories;

import com.cnesten.medarrivalbackend.Security.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository<T extends User> extends JpaRepository<T, Long> {
    Optional<T> findById(Long id);
    Optional<T> findByEmail(String email);
}
