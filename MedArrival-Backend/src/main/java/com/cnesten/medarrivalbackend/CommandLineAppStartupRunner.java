package com.cnesten.medarrivalbackend;

import com.cnesten.medarrivalbackend.Security.Models.Role;
import com.cnesten.medarrivalbackend.Security.Models.RoleConstants;
import com.cnesten.medarrivalbackend.Security.Models.User;
import com.cnesten.medarrivalbackend.Security.Repositories.RoleRepository;
import com.cnesten.medarrivalbackend.Security.Repositories.UserRepository;
import com.cnesten.medarrivalbackend.Security.Services.RoleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Transactional
@RequiredArgsConstructor
public class CommandLineAppStartupRunner implements CommandLineRunner {

    private final UserRepository<User> userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        roleService.createRoleIfNotFound(RoleConstants.ROLE_ADMIN);

        // Create admin user
        if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleConstants.ROLE_ADMIN);

            User admin = User.builder()
                    .email("admin@admin.com")
                    .password(passwordEncoder.encode("adminadmin"))
                    .firstname("Admin")
                    .lastname("Admin")
                    .isEmailVerified(true)
                    .build();

            admin.addRole(adminRole);
            userRepository.save(admin);
        }
    }
}
