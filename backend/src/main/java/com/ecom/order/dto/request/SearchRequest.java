package com.ecom.order.dto.request;

import com.ecom.order.domain.enums.OrderStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;

@Data
public class SearchRequest {

    private String keyword;
    private OrderStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant dateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant dateTo;

    private Long minAmountCents;
    private Long maxAmountCents;
    private String customerName;
    private String productTitle;
    private String sku;

    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDir = "desc";

    public String getKeyword() { return keyword; }
    public OrderStatus getStatus() { return status; }
    public Instant getDateFrom() { return dateFrom; }
    public Instant getDateTo() { return dateTo; }
    public Long getMinAmountCents() { return minAmountCents; }
    public Long getMaxAmountCents() { return maxAmountCents; }
    public String getCustomerName() { return customerName; }
    public String getProductTitle() { return productTitle; }
    public String getSku() { return sku; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public String getSortBy() { return sortBy; }
    public String getSortDir() { return sortDir; }
}
