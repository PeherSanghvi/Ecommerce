package com.ecom.order.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private Instant timestamp;
    private List<FieldError> fieldErrors;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int status;
        private String error;
        private String message;
        private String path;
        private Instant timestamp;
        private List<FieldError> fieldErrors;

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder error(String error) {
            this.error = error;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder fieldErrors(List<FieldError> fieldErrors) {
            this.fieldErrors = fieldErrors;
            return this;
        }

        public ApiError build() {
            ApiError apiError = new ApiError();
            apiError.status = this.status;
            apiError.error = this.error;
            apiError.message = this.message;
            apiError.path = this.path;
            apiError.timestamp = this.timestamp;
            apiError.fieldErrors = this.fieldErrors;
            return apiError;
        }
    }

    @Data
    public static class FieldError {
        private String field;
        private String message;

        public static FieldErrorBuilder builder() {
            return new FieldErrorBuilder();
        }

        public static class FieldErrorBuilder {
            private String field;
            private String message;

            public FieldErrorBuilder field(String field) {
                this.field = field;
                return this;
            }

            public FieldErrorBuilder message(String message) {
                this.message = message;
                return this;
            }

            public FieldError build() {
                FieldError fieldError = new FieldError();
                fieldError.field = this.field;
                fieldError.message = this.message;
                return fieldError;
            }
        }
    }
}
