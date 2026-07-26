package com.ecom.order.seeder;

import com.ecom.order.domain.entity.*;
import com.ecom.order.domain.enums.OrderStatus;
import com.ecom.order.domain.enums.PaymentStatus;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.ProductRepository;
import com.ecom.order.repository.UserRepository;
import com.ecom.order.sync.OrderSyncService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderSyncService syncService;
    private final ObjectMapper objectMapper;

    @Value("${app.seeder.enabled:true}")
    private boolean seederEnabled;

    private static final String DUMMY_JSON = "https://dummyjson.com";
    private static final OrderStatus[] STATUSES = OrderStatus.values();
    private static final PaymentStatus[] PAY_STATUSES = PaymentStatus.values();

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (!seederEnabled) return;
        if (productRepository.count() > 0) {
            log.info("Seed data already present, skipping");
            return;
        }
        log.info("Starting data seeding from dummyjson.com …");
        try {
            List<Product> products = seedProducts();
            List<User> users = seedUsers();
            seedOrders(products, users);
            log.info("Seeding complete: {} products, {} users, {} orders",
                    products.size(), users.size(), orderRepository.count());
        } catch (Exception e) {
            log.warn("Seeding failed (proceeding without seed data): {}", e.getMessage());
        }
    }

    private List<Product> seedProducts() {
        WebClient client = WebClient.create(DUMMY_JSON);
        List<Product> all = new ArrayList<>();

        try {
            String body = client.get().uri("/products?limit=100&skip=0")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = objectMapper.readTree(body);
            JsonNode prods = root.get("products");

            for (JsonNode p : prods) {
                long priceCents = Math.round(p.path("price").asDouble(10.0) * 100);
                double discount = p.path("discountPercentage").asDouble(0);
                long effectiveCents = priceCents - Math.round(priceCents * discount / 100.0);

                Product product = Product.builder()
                        .sku("SKU-" + p.path("id").asInt())
                        .title(p.path("title").asText("Product"))
                        .description(p.path("description").asText(""))
                        .brand(p.path("brand").asText("Generic"))
                        .category(p.path("category").asText("general"))
                        .thumbnailUrl(p.path("thumbnail").asText(""))
                        .priceCents(priceCents)
                        .discountPercentage(discount)
                        .effectivePriceCents(effectiveCents)
                        .stockQuantity(ThreadLocalRandom.current().nextInt(10, 200))
                        .rating(p.path("rating").asDouble(4.0))
                        .active(true)
                        .build();

                all.add(product);
            }
        } catch (Exception e) {
            log.warn("Could not fetch products from dummyjson, using fallback: {}", e.getMessage());
            all = buildFallbackProducts();
        }

        List<Product> saved = productRepository.saveAll(all);
        log.info("Seeded {} products", saved.size());
        return saved;
    }

    private List<User> seedUsers() {
        WebClient client = WebClient.create(DUMMY_JSON);
        List<User> all = new ArrayList<>();

        try {
            String body = client.get().uri("/users?limit=25&skip=0")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = objectMapper.readTree(body);
            JsonNode users = root.get("users");

            for (JsonNode u : users) {
                JsonNode addr = u.path("address");
                User user = User.builder()
                        .firstName(u.path("firstName").asText("First"))
                        .lastName(u.path("lastName").asText("Last"))
                        .email(u.path("email").asText("user@example.com"))
                        .phone(u.path("phone").asText(""))
                        .username(u.path("username").asText("user"))
                        .address(Address.builder()
                                .street(addr.path("address").asText(""))
                                .city(addr.path("city").asText(""))
                                .state(addr.path("state").asText(""))
                                .postalCode(addr.path("postalCode").asText(""))
                                .country("US")
                                .build())
                        .active(true)
                        .build();
                all.add(user);
            }
        } catch (Exception e) {
            log.warn("Could not fetch users from dummyjson, using fallback: {}", e.getMessage());
            all = buildFallbackUsers();
        }

        List<User> saved = userRepository.saveAll(all);
        log.info("Seeded {} users", saved.size());
        return saved;
    }

    private void seedOrders(List<Product> products, List<User> users) {
        if (products.isEmpty() || users.isEmpty()) return;

        List<Order> orders = new ArrayList<>();
        Random rng = ThreadLocalRandom.current();
        Instant now = Instant.now();

        for (int i = 0; i < 1000; i++) {
            User user = users.get(rng.nextInt(users.size()));
            int itemCount = rng.nextInt(1, 5);
            Set<Integer> chosen = new HashSet<>();
            while (chosen.size() < itemCount) chosen.add(rng.nextInt(products.size()));

            List<ProductSnapshot> snapshots = new ArrayList<>();
            long subTotal = 0L, discount = 0L;

            for (int idx : chosen) {
                Product p = products.get(idx);
                int qty = rng.nextInt(1, 4);
                long unit = p.getEffectivePriceCents();
                long orig = p.getPriceCents() * qty;
                long line = unit * qty;
                subTotal += orig;
                discount += (orig - line);

                snapshots.add(ProductSnapshot.builder()
                        .productId(p.getId())
                        .sku(p.getSku())
                        .title(p.getTitle())
                        .brand(p.getBrand())
                        .category(p.getCategory())
                        .thumbnailUrl(p.getThumbnailUrl())
                        .unitPriceCents(unit)
                        .quantity(qty)
                        .lineTotalCents(line)
                        .build());
            }

            long total = subTotal - discount;
            // Random date within last 180 days
            Instant createdAt = now.minus(rng.nextInt(0, 180), ChronoUnit.DAYS)
                    .minus(rng.nextInt(0, 1440), ChronoUnit.MINUTES);

            OrderStatus status = STATUSES[rng.nextInt(STATUSES.length)];
            PaymentStatus payStatus = status == OrderStatus.DELIVERED || status == OrderStatus.SHIPPED
                    ? PaymentStatus.PAID
                    : PAY_STATUSES[rng.nextInt(PAY_STATUSES.length)];

            Order order = Order.builder()
                    .idempotencyKey("seed-" + UUID.randomUUID())
                    .customer(CustomerSnapshot.builder()
                            .customerId(user.getId())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .build())
                    .items(snapshots)
                    .shippingAddress(user.getAddress() != null ? Address.builder()
                            .street(user.getAddress().getStreet())
                            .city(user.getAddress().getCity())
                            .state(user.getAddress().getState())
                            .postalCode(user.getAddress().getPostalCode())
                            .country(user.getAddress().getCountry())
                            .build() : null)
                    .status(status)
                    .paymentStatus(payStatus)
                    .subTotalCents(subTotal)
                    .discountCents(discount)
                    .totalCents(total)
                    .syncedToSearch(false)
                    .build();

            orders.add(order);
        }

        List<Order> saved = orderRepository.saveAll(orders);
        log.info("Seeded {} orders", saved.size());

        // Sync to OpenSearch in background
        new Thread(() -> {
            int synced = syncService.fullReindex();
            log.info("Initial OpenSearch sync: {} orders indexed", synced);
        }, "initial-sync").start();
    }

    // ── Fallback data ──────────────────────────────────────────────────────────

    private List<Product> buildFallbackProducts() {
        String[] categories = {"electronics", "clothing", "books", "sports", "home"};
        String[] brands = {"Apple", "Samsung", "Nike", "Adidas", "Sony"};
        List<Product> list = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            long price = (long) (ThreadLocalRandom.current().nextInt(500, 50000));
            double disc = ThreadLocalRandom.current().nextInt(0, 30);
            list.add(Product.builder()
                    .sku("SKU-FB-" + i)
                    .title("Product " + i)
                    .description("Sample product description " + i)
                    .brand(brands[i % brands.length])
                    .category(categories[i % categories.length])
                    .thumbnailUrl("https://via.placeholder.com/150")
                    .priceCents(price)
                    .discountPercentage(disc)
                    .effectivePriceCents(price - Math.round(price * disc / 100.0))
                    .stockQuantity(ThreadLocalRandom.current().nextInt(10, 100))
                    .rating(3.5 + ThreadLocalRandom.current().nextDouble(1.5))
                    .active(true)
                    .build());
        }
        return list;
    }

    private List<User> buildFallbackUsers() {
        List<User> list = new ArrayList<>();
        String[][] data = {
                {"Alice", "Smith", "alice@example.com"},
                {"Bob", "Jones", "bob@example.com"},
                {"Carol", "Williams", "carol@example.com"},
                {"David", "Brown", "david@example.com"},
                {"Eve", "Davis", "eve@example.com"}
        };
        for (String[] d : data) {
            list.add(User.builder()
                    .firstName(d[0]).lastName(d[1]).email(d[2])
                    .username(d[0].toLowerCase())
                    .phone("+1-555-000-0000")
                    .address(Address.builder().street("123 Main St").city("New York")
                            .state("NY").postalCode("10001").country("US").build())
                    .active(true).build());
        }
        return list;
    }
}
