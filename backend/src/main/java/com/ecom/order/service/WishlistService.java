package com.ecom.order.service;

import com.ecom.order.domain.entity.Wishlist;
import com.ecom.order.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public Wishlist getWishlist(String userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> createWishlist(userId));
    }

    public Wishlist addToWishlist(String userId, String productId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseGet(() -> createWishlist(userId));

        if (!wishlist.getProductIds().contains(productId)) {
            wishlist.getProductIds().add(productId);
            wishlistRepository.save(wishlist);
        }

        return wishlist;
    }

    public Wishlist removeFromWishlist(String userId, String productId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        wishlist.getProductIds().remove(productId);
        wishlistRepository.save(wishlist);
        return wishlist;
    }

    public void clearWishlist(String userId) {
        wishlistRepository.deleteByUserId(userId);
    }

    private Wishlist createWishlist(String userId) {
        Wishlist wishlist = new Wishlist();
        wishlist.setUserId(userId);
        wishlist.setProductIds(new ArrayList<>());
        return wishlistRepository.save(wishlist);
    }
}
