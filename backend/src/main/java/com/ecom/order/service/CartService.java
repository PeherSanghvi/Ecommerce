package com.ecom.order.service;

import com.ecom.order.domain.entity.Cart;
import com.ecom.order.dto.request.AddToCartRequest;
import com.ecom.order.dto.request.UpdateCartItemRequest;
import com.ecom.order.dto.response.CartResponse;
import com.ecom.order.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    public CartResponse getCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCart(userId));
        return mapToResponse(cart);
    }

    public CartResponse addToCart(String userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCart(userId));

        Cart.CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            Cart.CartItem newItem = new Cart.CartItem(
                    request.getProductId(),
                    request.getSku(),
                    request.getTitle(),
                    request.getThumbnailUrl(),
                    request.getUnitPriceCents(),
                    request.getQuantity()
            );
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse updateCartItem(String userId, String productId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Cart.CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (request.getQuantity() == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(request.getQuantity());
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse removeFromCart(String userId, String productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public void clearCart(String userId) {
        cartRepository.deleteByUserId(userId);
    }

    private Cart createCart(String userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartResponse.CartItemResponse.builder()
                        .productId(item.getProductId())
                        .sku(item.getSku())
                        .title(item.getTitle())
                        .thumbnailUrl(item.getThumbnailUrl())
                        .unitPriceCents(item.getUnitPriceCents())
                        .quantity(item.getQuantity())
                        .lineTotalCents(item.getUnitPriceCents() * item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        long totalCents = itemResponses.stream()
                .mapToLong(CartResponse.CartItemResponse::getLineTotalCents)
                .sum();

        int totalItems = itemResponses.stream()
                .mapToInt(CartResponse.CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .totalCents(totalCents)
                .totalItems(totalItems)
                .build();
    }
}
