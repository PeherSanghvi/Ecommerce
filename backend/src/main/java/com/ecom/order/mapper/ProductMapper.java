package com.ecom.order.mapper;

import com.ecom.order.domain.entity.Product;
import com.ecom.order.dto.request.ProductRequest;
import com.ecom.order.dto.response.ProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponse toResponse(Product product);

    Product toEntity(ProductRequest request);

    void updateEntity(ProductRequest request, @MappingTarget Product product);
}
