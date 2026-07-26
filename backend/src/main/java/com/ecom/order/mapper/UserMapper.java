package com.ecom.order.mapper;

import com.ecom.order.domain.entity.User;
import com.ecom.order.dto.response.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
