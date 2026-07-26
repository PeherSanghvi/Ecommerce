package com.ecom.order.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <T> Builder<T> builder() { return new Builder<T>(); }

    public static class Builder<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public Builder<T> content(List<T> content) { this.content = content; return this; }
        public Builder<T> page(int page) { this.page = page; return this; }
        public Builder<T> size(int size) { this.size = size; return this; }
        public Builder<T> totalElements(long totalElements) { this.totalElements = totalElements; return this; }
        public Builder<T> totalPages(int totalPages) { this.totalPages = totalPages; return this; }
        public Builder<T> last(boolean last) { this.last = last; return this; }

        public PageResponse<T> build() {
            PageResponse<T> response = new PageResponse<T>();
            response.content = this.content;
            response.page = this.page;
            response.size = this.size;
            response.totalElements = this.totalElements;
            response.totalPages = this.totalPages;
            response.last = this.last;
            return response;
        }
    }
}
