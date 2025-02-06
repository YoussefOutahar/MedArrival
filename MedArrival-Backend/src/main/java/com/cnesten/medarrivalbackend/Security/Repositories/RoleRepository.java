package com.cnesten.medarrivalbackend.Security.Repositories;

import com.cnesten.medarrivalbackend.Security.Models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);
}
