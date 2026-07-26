package com.ecom.order.service.impl;

import com.ecom.order.dto.response.UserResponse;
import com.ecom.order.exception.ResourceNotFoundException;
import com.ecom.order.mapper.UserMapper;
import com.ecom.order.repository.UserRepository;
import com.ecom.order.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.isActive())
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
