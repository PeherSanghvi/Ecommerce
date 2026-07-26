package com.ecom.order.service;

import com.ecom.order.dto.request.SearchRequest;
import com.ecom.order.dto.response.KpiResponse;
import com.ecom.order.dto.response.SearchResponse;

public interface SearchService {
    SearchResponse search(SearchRequest request);
    KpiResponse getKpis();
}
