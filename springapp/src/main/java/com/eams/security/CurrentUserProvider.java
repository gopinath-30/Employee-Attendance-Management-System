package com.eams.security;

import com.eams.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AppUserDetails details) {
            return details.getUser();
        }
        throw new IllegalStateException("No authenticated user found in security context");
    }
}
