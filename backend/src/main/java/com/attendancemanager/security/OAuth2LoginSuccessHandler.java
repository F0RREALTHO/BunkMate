package com.attendancemanager.security;

import com.attendancemanager.entity.AuthProvider;
import com.attendancemanager.entity.User;
import com.attendancemanager.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = token.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleSubjectId = oAuth2User.getAttribute("sub");

        if (email == null || googleSubjectId == null) {
            getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/login?error=oauth2_missing_email");
            return;
        }

        Optional<User> userByGoogleId = userRepository.findByGoogleSubjectId(googleSubjectId);
        User user;

        if (userByGoogleId.isPresent()) {
            user = userByGoogleId.get();
        } else {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                // Link account
                user = userByEmail.get();
                user.setGoogleSubjectId(googleSubjectId);
                user.setAuthProvider(AuthProvider.GOOGLE);
                user = userRepository.save(user);
            } else {
                // Create new user
                user = User.builder()
                        .name(name != null ? name : "Student")
                        .email(email)
                        .googleSubjectId(googleSubjectId)
                        .authProvider(AuthProvider.GOOGLE)
                        .passwordHash(null) // Safe since we removed NOT NULL constraint
                        .build();
                user = userRepository.save(user);
            }
        }

        String jwt = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        String targetUrl = frontendUrl + "/oauth2/redirect?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
