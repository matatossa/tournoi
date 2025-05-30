package com.tournament.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class DebugSessionFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpSession session = req.getSession(false);
        String sessionId = (session != null) ? session.getId() : "NO SESSION";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = (auth != null) ? auth.getPrincipal().toString() : "NO AUTH";
        System.out.println("[DEBUG] " + req.getMethod() + " " + req.getRequestURI() +
                " | JSESSIONID: " + sessionId +
                " | Principal: " + principal);
        chain.doFilter(request, response);
    }
} 