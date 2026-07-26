package com.ecom.order.controller;

import com.ecom.order.dto.request.CreateReviewRequest;
import com.ecom.order.dto.request.UpdateReviewRequest;
import com.ecom.order.dto.response.ReviewResponse;
import com.ecom.order.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getAverageRating(productId));
    }

    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getReviewCount(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewCount(productId));
    }

    @GetMapping("/product/{productId}/user")
    public ResponseEntity<ReviewResponse> getUserReview(
            @PathVariable String productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getUserReview(productId, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.createReview(
                userDetails.getUsername(),
                userDetails.getUsername(),
                request
        ));
    }

    @PutMapping("/product/{productId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable String productId,
            @Valid @RequestBody UpdateReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.updateReview(productId, userDetails.getUsername(), request));
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable String productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(productId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
