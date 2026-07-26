package com.ecom.order.mapper;

import com.ecom.order.domain.entity.*;
import com.ecom.order.dto.request.AddressRequest;
import com.ecom.order.dto.response.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toResponse(Order order);

    CustomerSnapshotResponse toResponse(CustomerSnapshot snapshot);

    ProductSnapshotResponse toResponse(ProductSnapshot snapshot);

    AddressResponse toResponse(Address address);

    Address toEntity(AddressRequest request);
}
