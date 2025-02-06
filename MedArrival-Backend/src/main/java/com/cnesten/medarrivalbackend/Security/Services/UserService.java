package com.cnesten.medarrivalbackend.Security.Services;

import com.cnesten.medarrivalbackend.Exceptions.UnauthorizedException;
import com.cnesten.medarrivalbackend.Security.Models.User;
import com.cnesten.medarrivalbackend.Security.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository<User> userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository<User> repository;
    private final JwtService jwtService;

    public Long getUserById(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ((User) userDetails).getId();
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> listAllUsers() {
        return userRepository.findAll();
    }
    public Page<User> listAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalStateException("Invalid or missing Authorization header");
        }

        // Extract token by removing "Bearer " prefix
        String token = authHeader.substring(7);

        Long userId = jwtService.extractUserId(token);

        return repository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public User getCurrentUser() {
        User userPrincipal = null;
        SecurityContext securityContext = SecurityContextHolder.getContext();
        if(securityContext.getAuthentication() == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        Object principal = securityContext.getAuthentication().getPrincipal();
        if (principal instanceof User) {
            userPrincipal = ((User) principal);
        }
        return userPrincipal;
    }
}