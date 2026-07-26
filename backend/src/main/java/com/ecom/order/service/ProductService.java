package com.ecom.order.service;

import com.ecom.order.dto.request.ProductRequest;
import com.ecom.order.dto.response.PageResponse;
import com.ecom.order.dto.response.ProductResponse;

public interface ProductService {
    PageResponse<ProductResponse> getAllProducts(int page, int size, String category, String brand, String keyword, String sort);
    ProductResponse getProductById(String id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(String id, ProductRequest request);
    void deleteProduct(String id);
}
