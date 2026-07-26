package com.ecom.order.mapper;

import com.ecom.order.domain.entity.Address;
import com.ecom.order.domain.entity.CustomerSnapshot;
import com.ecom.order.domain.entity.Order;
import com.ecom.order.domain.entity.ProductSnapshot;
import com.ecom.order.dto.request.AddressRequest;
import com.ecom.order.dto.response.AddressResponse;
import com.ecom.order.dto.response.CustomerSnapshotResponse;
import com.ecom.order.dto.response.OrderResponse;
import com.ecom.order.dto.response.ProductSnapshotResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-14T16:17:16+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.id( order.getId() );
        orderResponse.idempotencyKey( order.getIdempotencyKey() );
        orderResponse.customer( toResponse( order.getCustomer() ) );
        orderResponse.items( productSnapshotListToProductSnapshotResponseList( order.getItems() ) );
        orderResponse.shippingAddress( toResponse( order.getShippingAddress() ) );
        orderResponse.status( order.getStatus() );
        orderResponse.paymentStatus( order.getPaymentStatus() );
        orderResponse.subTotalCents( order.getSubTotalCents() );
        orderResponse.discountCents( order.getDiscountCents() );
        orderResponse.totalCents( order.getTotalCents() );
        orderResponse.notes( order.getNotes() );
        orderResponse.syncedToSearch( order.isSyncedToSearch() );
        orderResponse.lastSyncedAt( order.getLastSyncedAt() );
        orderResponse.version( order.getVersion() );
        orderResponse.createdAt( order.getCreatedAt() );
        orderResponse.updatedAt( order.getUpdatedAt() );

        return orderResponse.build();
    }

    @Override
    public CustomerSnapshotResponse toResponse(CustomerSnapshot snapshot) {
        if ( snapshot == null ) {
            return null;
        }

        CustomerSnapshotResponse.CustomerSnapshotResponseBuilder customerSnapshotResponse = CustomerSnapshotResponse.builder();

        customerSnapshotResponse.customerId( snapshot.getCustomerId() );
        customerSnapshotResponse.firstName( snapshot.getFirstName() );
        customerSnapshotResponse.lastName( snapshot.getLastName() );
        customerSnapshotResponse.email( snapshot.getEmail() );
        customerSnapshotResponse.phone( snapshot.getPhone() );

        return customerSnapshotResponse.build();
    }

    @Override
    public ProductSnapshotResponse toResponse(ProductSnapshot snapshot) {
        if ( snapshot == null ) {
            return null;
        }

        ProductSnapshotResponse.ProductSnapshotResponseBuilder productSnapshotResponse = ProductSnapshotResponse.builder();

        productSnapshotResponse.productId( snapshot.getProductId() );
        productSnapshotResponse.sku( snapshot.getSku() );
        productSnapshotResponse.title( snapshot.getTitle() );
        productSnapshotResponse.brand( snapshot.getBrand() );
        productSnapshotResponse.category( snapshot.getCategory() );
        productSnapshotResponse.thumbnailUrl( snapshot.getThumbnailUrl() );
        productSnapshotResponse.unitPriceCents( snapshot.getUnitPriceCents() );
        productSnapshotResponse.quantity( snapshot.getQuantity() );
        productSnapshotResponse.lineTotalCents( snapshot.getLineTotalCents() );

        return productSnapshotResponse.build();
    }

    @Override
    public AddressResponse toResponse(Address address) {
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

    @Override
    public Address toEntity(AddressRequest request) {
        if ( request == null ) {
            return null;
        }

        Address.Builder address = Address.builder();

        address.street( request.getStreet() );
        address.city( request.getCity() );
        address.state( request.getState() );
        address.postalCode( request.getPostalCode() );
        address.country( request.getCountry() );

        return address.build();
    }

    protected List<ProductSnapshotResponse> productSnapshotListToProductSnapshotResponseList(List<ProductSnapshot> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductSnapshotResponse> list1 = new ArrayList<ProductSnapshotResponse>( list.size() );
        for ( ProductSnapshot productSnapshot : list ) {
            list1.add( toResponse( productSnapshot ) );
        }

        return list1;
    }
}
