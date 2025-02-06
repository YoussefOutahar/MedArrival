package com.cnesten.medarrivalbackend.Security.Services;

import com.cnesten.medarrivalbackend.Exceptions.UnauthorizedException;
import com.cnesten.medarrivalbackend.Security.Models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {

	public User getUser() {
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
