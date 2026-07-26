package com.ecom.order.mapper;

import com.ecom.order.domain.entity.Address;
import com.ecom.order.domain.entity.User;
import com.ecom.order.dto.response.AddressResponse;
import com.ecom.order.dto.response.UserResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-14T16:17:17+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.id( user.getId() );
        userResponse.firstName( user.getFirstName() );
        userResponse.lastName( user.getLastName() );
        userResponse.email( user.getEmail() );
        userResponse.phone( user.getPhone() );
        userResponse.address( addressToAddressResponse( user.getAddress() ) );
        userResponse.username( user.getUsername() );
        userResponse.active( user.isActive() );
        userResponse.createdAt( user.getCreatedAt() );

        return userResponse.build();
    }

    protected AddressResponse addressToAddressResponse(Address address) {
        if ( address == null ) {
            return null;
        }

        AddressResponse.AddressResponseBuilder addressResponse = AddressResponse.builder();

        addressResponse.street( address.getStreet() );
        addressResponse.city( address.getCity() );
        addressResponse.state( address.getState() );
        addressResponse.postalCode( address.getPostalCode() );
        addressResponse.country( address.getCountry() );

        return addressResponse.build();
    }
}
