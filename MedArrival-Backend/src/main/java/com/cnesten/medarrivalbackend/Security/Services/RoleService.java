package com.cnesten.medarrivalbackend.Security.Services;

import com.cnesten.medarrivalbackend.Security.Models.Role;
import com.cnesten.medarrivalbackend.Security.Models.User;
import com.cnesten.medarrivalbackend.Security.Repositories.RoleRepository;
import com.cnesten.medarrivalbackend.Security.Repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@AllArgsConstructor
public class RoleService {
	private final RoleRepository roleRepository;
	private final UserRepository<User> userRepository;

	@Transactional
	public Role findRoleByName(String roleName) {
		Role role = roleRepository.findByName(roleName);
		if (role == null) {
			log.warn("Role {} not found", roleName);
		}
		return role;
	}

	@Transactional
	public void addRoleToUser(Long id, String roleName) {
		User user = userRepository.findById(id).orElse(null);
		Role role = findRoleByName(roleName);
		if (role == null) {
			role = createRoleIfNotFound(roleName);
		}
		user.addRole(role);
		log.info("Added role {} to user {}", roleName, id);
	}

	@Transactional
	public Role createRoleIfNotFound(String roleName) {
		Role role = roleRepository.findByName(roleName);
		if (role == null) {
			role = new Role();
			role.setName(roleName);
			role = roleRepository.save(role);
			log.info("Created new role: {}", roleName);
		}
		return role;
	}
}
