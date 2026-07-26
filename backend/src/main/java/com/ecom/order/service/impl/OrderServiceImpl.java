package com.ecom.order.service.impl;

import com.ecom.order.domain.entity.*;
import com.ecom.order.domain.enums.OrderStatus;
import com.ecom.order.domain.enums.PaymentStatus;
import com.ecom.order.dto.request.CheckoutItemRequest;
import com.ecom.order.dto.request.CheckoutRequest;
import com.ecom.order.dto.request.UpdateOrderStatusRequest;
import com.ecom.order.dto.response.OrderResponse;
import com.ecom.order.dto.response.PageResponse;
import com.ecom.order.exception.*;
import com.ecom.order.mapper.OrderMapper;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.ProductRepository;
import com.ecom.order.repository.UserRepository;
import com.ecom.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    /**
     * Transactional checkout:
     * 1. Resolve idempotency key — return existing order if already processed.
     * 2. Load customer from MongoDB (never trust client-supplied data).
     * 3. Load each product, validate stock, recalculate price server-side.
     * 4. Reserve inventory atomically within the same transaction.
     * 5. Persist the order.
     * 6. Rolls back automatically if any step throws.
     */
    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        // 1. Idempotency check
        String idemKey = request.getIdempotencyKey();
        if (idemKey == null || idemKey.isBlank()) {
            idemKey = UUID.randomUUID().toString();
        }
        final String idempotencyKey = idemKey;

        var existing = orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent replay for key={}", idempotencyKey);
            return orderMapper.toResponse(existing.get());
        }

        // 2. Load customer
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getCustomerId()));

        // 3. Load products, validate stock, build snapshots
        List<ProductSnapshot> snapshots = new ArrayList<>();
        long subTotalCents = 0L;
        long discountCents = 0L;

        for (CheckoutItemRequest item : request.getItems()) {
            // Load with optimistic lock — throws if concurrent modification wins
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", item.getProductId()));

            if (!product.isActive()) {
                throw new IllegalArgumentException("Product is no longer available: " + product.getTitle());
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        product.getId(), item.getQuantity(), product.getStockQuantity());
            }

            // Server-side price calculation — never trust frontend
            long unitPrice = product.getEffectivePriceCents();
            long lineTotal = unitPrice * item.getQuantity();
            long originalLineTotal = product.getPriceCents() * item.getQuantity();
            long lineDiscount = originalLineTotal - lineTotal;

            snapshots.add(ProductSnapshot.builder()
                    .productId(product.getId())
                    .sku(product.getSku())
                    .title(product.getTitle())
                    .brand(product.getBrand())
                    .category(product.getCategory())
                    .thumbnailUrl(product.getThumbnailUrl())
                    .unitPriceCents(unitPrice)
                    .quantity(item.getQuantity())
                    .lineTotalCents(lineTotal)
                    .build());

            subTotalCents += originalLineTotal;
            discountCents += lineDiscount;

            // 4. Reserve inventory atomically
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        long totalCents = subTotalCents - discountCents;

        // 5. Build and persist order
        Address shippingAddress = null;
        if (request.getShippingAddress() != null) {
            shippingAddress = orderMapper.toEntity(request.getShippingAddress());
        }

        Order order = Order.builder()
                .idempotencyKey(idempotencyKey)
                .customer(CustomerSnapshot.builder()
                        .customerId(customer.getId())
                        .firstName(customer.getFirstName())
                        .lastName(customer.getLastName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .build())
                .items(snapshots)
                .shippingAddress(shippingAddress)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .subTotalCents(subTotalCents)
                .discountCents(discountCents)
                .totalCents(totalCents)
                .notes(request.getNotes())
                .syncedToSearch(false)
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created: id={}, total={} cents, items={}",
                saved.getId(), saved.getTotalCents(), saved.getItems().size());
        return orderMapper.toResponse(saved);
    }

    @Override
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders;

        if (status != null && !status.isBlank()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return toPageResponse(orders);
    }

    @Override
    public PageResponse<OrderResponse> getOrdersByCustomer(String customerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByCustomer_CustomerIdOrderByCreatedAtDesc(customerId, pageable);
        return toPageResponse(orders);
    }

    @Override
    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toResponse(order);
    }

    /**
     * Optimistic concurrency: the caller must supply the current version.
     * If the stored version differs, we return HTTP 409 via OptimisticLockException.
     */
    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (!order.getVersion().equals(request.getVersion())) {
            throw new OptimisticLockException(
                    String.format("Stale update: expected version %d but found %d. Please refresh and retry.",
                            request.getVersion(), order.getVersion()));
        }

        order.setStatus(request.getStatus());
        order.setSyncedToSearch(false); // force re-sync
        Order saved = orderRepository.save(order);
        log.info("Order status updated: id={}, status={}, version={}", saved.getId(), saved.getStatus(), saved.getVersion());
        return orderMapper.toResponse(saved);
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> page) {
        return PageResponse.<OrderResponse>builder()
                .content(page.getContent().stream().map(orderMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
