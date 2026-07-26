package com.ecom.order.service.impl;

import com.ecom.order.domain.entity.Product;
import com.ecom.order.dto.request.ProductRequest;
import com.ecom.order.dto.response.PageResponse;
import com.ecom.order.dto.response.ProductResponse;
import com.ecom.order.exception.ResourceNotFoundException;
import com.ecom.order.mapper.ProductMapper;
import com.ecom.order.repository.ProductRepository;
import com.ecom.order.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public PageResponse<ProductResponse> getAllProducts(int page, int size, String category, String brand, String keyword, String sort) {
        Sort sortObj = Sort.by("createdAt").descending();
        
        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    sortObj = Sort.by("effectivePriceCents").ascending();
                    break;
                case "price_desc":
                    sortObj = Sort.by("effectivePriceCents").descending();
                    break;
                case "title_asc":
                    sortObj = Sort.by("title").ascending();
                    break;
                case "title_desc":
                    sortObj = Sort.by("title").descending();
                    break;
                case "rating_desc":
                    sortObj = Sort.by("rating").descending();
                    break;
                default:
                    sortObj = Sort.by("createdAt").descending();
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Product> products;

        if (keyword != null && !keyword.isBlank()) {
            products = productRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryIgnoreCaseAndActiveTrue(category, pageable);
        } else if (brand != null && !brand.isBlank()) {
            products = productRepository.findByBrandAndActiveTrue(brand, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }

        return PageResponse.<ProductResponse>builder()
                .content(products.getContent().stream().map(productMapper::toResponse).toList())
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Product product = productMapper.toEntity(request);
        product.setEffectivePriceCents(calculateEffectivePrice(request.getPriceCents(), request.getDiscountPercentage()));
        product.setActive(true);
        Product saved = productRepository.save(product);
        log.info("Created product: id={}, sku={}", saved.getId(), saved.getSku());
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productMapper.updateEntity(request, product);
        product.setEffectivePriceCents(calculateEffectivePrice(request.getPriceCents(), request.getDiscountPercentage()));
        Product saved = productRepository.save(product);
        log.info("Updated product: id={}", saved.getId());
        return productMapper.toResponse(saved);
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Soft-deleted product: id={}", id);
    }

    private long calculateEffectivePrice(long priceCents, double discountPercentage) {
        if (discountPercentage <= 0) return priceCents;
        long discount = Math.round(priceCents * discountPercentage / 100.0);
        return priceCents - discount;
    }
}
