package com.ecom.order.service;

import com.ecom.order.dto.request.CheckoutRequest;
import com.ecom.order.dto.request.UpdateOrderStatusRequest;
import com.ecom.order.dto.response.OrderResponse;
import com.ecom.order.dto.response.PageResponse;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    PageResponse<OrderResponse> getAllOrders(int page, int size, String status);

    PageResponse<OrderResponse> getOrdersByCustomer(String customerId, int page, int size);

    OrderResponse getOrderById(String id);

    OrderResponse updateOrderStatus(String id, UpdateOrderStatusRequest request);
}
