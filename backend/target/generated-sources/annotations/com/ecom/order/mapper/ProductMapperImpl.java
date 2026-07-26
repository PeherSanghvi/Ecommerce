package com.ecom.order.mapper;

import com.ecom.order.domain.entity.Product;
import com.ecom.order.dto.request.ProductRequest;
import com.ecom.order.dto.response.ProductResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-14T16:17:17+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponse toResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.id( product.getId() );
        productResponse.sku( product.getSku() );
        productResponse.title( product.getTitle() );
        productResponse.description( product.getDescription() );
        productResponse.brand( product.getBrand() );
        productResponse.category( product.getCategory() );
        productResponse.thumbnailUrl( product.getThumbnailUrl() );
        List<String> list = product.getImageUrls();
        if ( list != null ) {
            productResponse.imageUrls( new ArrayList<String>( list ) );
        }
        productResponse.priceCents( product.getPriceCents() );
        productResponse.discountPercentage( product.getDiscountPercentage() );
        productResponse.effectivePriceCents( product.getEffectivePriceCents() );
        productResponse.stockQuantity( product.getStockQuantity() );
        productResponse.rating( product.getRating() );
        productResponse.active( product.isActive() );
        productResponse.version( product.getVersion() );
        productResponse.createdAt( product.getCreatedAt() );
        productResponse.updatedAt( product.getUpdatedAt() );

        return productResponse.build();
    }

    @Override
    public Product toEntity(ProductRequest request) {
        if ( request == null ) {
            return null;
        }

        Product.Builder product = Product.builder();

        product.sku( request.getSku() );
        product.title( request.getTitle() );
        product.description( request.getDescription() );
        product.brand( request.getBrand() );
        product.category( request.getCategory() );
        product.thumbnailUrl( request.getThumbnailUrl() );
        List<String> list = request.getImageUrls();
        if ( list != null ) {
            product.imageUrls( new ArrayList<String>( list ) );
        }
        product.priceCents( request.getPriceCents() );
        product.discountPercentage( request.getDiscountPercentage() );
        product.stockQuantity( request.getStockQuantity() );
        product.active( request.isActive() );

        return product.build();
    }

    @Override
    public void updateEntity(ProductRequest request, Product product) {
        if ( request == null ) {
            return;
        }

        product.setStockQuantity( request.getStockQuantity() );
        product.setActive( request.isActive() );
        product.setSku( request.getSku() );
        product.setTitle( request.getTitle() );
        product.setDescription( request.getDescription() );
        product.setBrand( request.getBrand() );
        product.setCategory( request.getCategory() );
        product.setThumbnailUrl( request.getThumbnailUrl() );
        if ( product.getImageUrls() != null ) {
            List<String> list = request.getImageUrls();
            if ( list != null ) {
                product.getImageUrls().clear();
                product.getImageUrls().addAll( list );
            }
            else {
                product.setImageUrls( null );
            }
        }
        else {
            List<String> list = request.getImageUrls();
            if ( list != null ) {
                product.setImageUrls( new ArrayList<String>( list ) );
            }
        }
        product.setPriceCents( request.getPriceCents() );
        product.setDiscountPercentage( request.getDiscountPercentage() );
    }
}
