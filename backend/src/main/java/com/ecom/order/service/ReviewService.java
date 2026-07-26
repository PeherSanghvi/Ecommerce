package com.ecom.order.service;

import com.ecom.order.domain.entity.Review;
import com.ecom.order.dto.request.CreateReviewRequest;
import com.ecom.order.dto.request.UpdateReviewRequest;
import com.ecom.order.dto.response.ReviewResponse;
import com.ecom.order.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<ReviewResponse> getProductReviews(String productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse getUserReview(String productId, String userId) {
        return reviewRepository.findByProductIdAndUserId(productId, userId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public ReviewResponse createReview(String userId, String userName, CreateReviewRequest request) {
        if (reviewRepository.findByProductIdAndUserId(request.getProductId(), userId).isPresent()) {
            throw new RuntimeException("Review already exists for this product");
        }

        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(userId)
                .userName(userName)
                .rating(request.getRating())
                .comment(request.getComment())
                .verifiedPurchase(request.isVerifiedPurchase())
                .build();

        reviewRepository.save(review);
        return mapToResponse(review);
    }

    public ReviewResponse updateReview(String productId, String userId, UpdateReviewRequest request) {
        Review review = reviewRepository.findByProductIdAndUserId(productId, userId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        reviewRepository.save(review);
        return mapToResponse(review);
    }

    public void deleteReview(String productId, String userId) {
        reviewRepository.deleteByProductIdAndUserId(productId, userId);
    }

    public double getAverageRating(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);

        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    public long getReviewCount(String productId) {
        return reviewRepository.countByProductId(productId);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .userName(review.getUserName())
                .rating(review.getRating())
                .comment(review.getComment())
                .verifiedPurchase(review.isVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}