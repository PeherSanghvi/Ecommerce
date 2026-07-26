# Visual Flow Diagrams & Reference

## 1. Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY MAP                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Products   │  Browse products
│    Page      │
└──────┬───────┘
       │ Select product & add to cart
       ↓
┌──────────────┐
│   Cart       │  Review items
│    Page      │  See subtotal, shipping, tax
└──────┬───────┘
       │ "Proceed to Checkout"
       ↓
┌──────────────────────────┐
│    CheckoutFlow          │
│    Step Indicator        │ Step 1 (current)
│    ↓                     │ Step 2 (next)
└──────┬───────────────────┘ Step 3 (next)
       │                     Step 4 (next)
       ↓
┌────────────────────────────────────────────┐
│  STEP 1: Shipping Address                  │
│  ┌──────────────────────────────────────┐  │
│  │ Full Name        [_______________]   │  │
│  │ Phone           [_______________]   │  │
│  │ Email           [_______________]   │  │
│  │ Street          [_______________]   │  │
│  │ City            [_______________]   │  │
│  │ State           [Select State  ▼]   │  │
│  │ PIN Code        [_______________]   │  │
│  │ Country         India (fixed)       │  │
│  └──────────────────────────────────────┘  │
│  [Back to Cart]  [Continue ➜]              │
└────────────────────────────────────────────┘
       │ User fills form & clicks Continue
       ↓
┌────────────────────────────────────────────┐
│  STEP 2: Review Order                      │
│  ┌──────────────────────────────────────┐  │
│  │ Items                                │  │
│  │  • Product 1 - Qty 2 - ₹9,999       │  │
│  │  • Product 2 - Qty 1 - ₹4,999       │  │
│  │                                      │  │
│  │ Subtotal:        ₹14,998             │  │
│  │ Shipping:        Complimentary       │  │
│  │ Tax (8%):        ₹1,200              │  │
│  │ ─────────────────────────            │  │
│  │ Total:           ₹16,198             │  │
│  │                                      │  │
│  │ Shipping Address:                    │  │
│  │ John Doe, 123 Street                │  │
│  │ Bangalore, Karnataka 560001          │  │
│  │                                      │  │
│  │ Estimated Delivery: July 26, 2026    │  │
│  │ [Edit Address]                       │  │
│  └──────────────────────────────────────┘  │
│  [Back]  [Choose Payment ➜]                │
└────────────────────────────────────────────┘
       │ User reviews & clicks Continue
       ↓
┌────────────────────────────────────────────┐
│  STEP 3: Payment Method                    │
│  ┌──────────────────────────────────────┐  │
│  │ Payment Methods:                     │  │
│  │                                      │  │
│  │ ◉ Cash on Delivery                  │  │
│  │   Pay when your order is delivered   │  │
│  │                                      │  │
│  │ ○ Online Payment (Coming soon)      │  │
│  │   Credit/Debit Card or UPI          │  │
│  │                                      │  │
│  │ Order Summary                        │  │
│  │ Subtotal:        ₹14,998             │  │
│  │ Shipping:        Complimentary       │  │
│  │ Tax:             ₹1,200              │  │
│  │ TOTAL:           ₹16,198             │  │
│  │                                      │  │
│  │ ✓ Your order is protected            │  │
│  └──────────────────────────────────────┘  │
│  [Back]  [Place Order ➜] (loading...)      │
└────────────────────────────────────────────┘
       │ User clicks "Place Order"
       │ API Call: POST /api/orders
       │ Order created in MongoDB
       ↓
┌─────────────────────────────────────────────┐
│  ORDER SUCCESS PAGE                         │
│  ╔═════════════════════════════════════════╗│
│  ║   ✓ Order Confirmed!                   ║│
│  ║   Thank you for your purchase          ║│
│  ╚═════════════════════════════════════════╝│
│                                             │
│  Order Number: #507f1f77bcf86cd799439013   │
│  Order Date: 22/07/2026                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Shipping Address                 │   │
│  │ John Doe                            │   │
│  │ 123 Main Street, Apt 4B             │   │
│  │ Bangalore, Karnataka 560001         │   │
│  │ 📞 98765 43210                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🚚 Estimated Delivery               │   │
│  │ Saturday, July 26, 2026              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💵 Payment Method                   │   │
│  │ Cash on Delivery                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Total Amount: ₹16,198                     │
│                                             │
│  [View My Orders]  [Continue Shopping]     │
│                                             │
│  ℹ️ Confirmation email sent to user         │
└─────────────────────────────────────────────┘
       │
       ├─→ View My Orders → /orders (see order history)
       │
       └─→ Continue Shopping → /products (browse more)
```

---

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      App.jsx                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ <BrowserRouter>                                       │  │
│  │ ├─ <WishlistProvider>                                 │  │
│  │ ├─ <UserProvider>                                     │  │
│  │ ├─ <CartProvider>                                     │  │
│  │ ├─ <CheckoutProvider> ← NEW                           │  │
│  │ │  └─ <ToastProvider>                                 │  │
│  │ │     └─ <Routes>                                     │  │
│  │ │        ├─ /checkout                                 │  │
│  │ │        │  └─ CheckoutFlow ← NEW                    │  │
│  │ │        │     ├─ Step Indicator                      │  │
│  │ │        │     ├─ Step Content (animated)             │  │
│  │ │        │     │  ├─ ShippingAddressStep ← NEW       │  │
│  │ │        │     │  ├─ ReviewOrderStep ← NEW           │  │
│  │ │        │     │  └─ PaymentMethodStep ← NEW         │  │
│  │ │        │     └─ Order Summary (sidebar)             │  │
│  │ │        │                                            │  │
│  │ │        └─ /order-success                            │  │
│  │ │           └─ OrderSuccess ← NEW                    │  │
│  │ │              ├─ Success Animation                   │  │
│  │ │              ├─ Order Details Cards                 │  │
│  │ │              └─ Action Buttons                      │  │
│  │ └─                                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

State Management:
├─ UserContext (user, isAuthenticated)
├─ CartContext (cart, items, totals, clearCart)
├─ CheckoutContext ← NEW
│  ├─ shippingAddress
│  ├─ paymentMethod
│  └─ orderData
├─ WishlistContext (wishlist)
└─ ToastContext (notifications)
```

---

## 3. Data Flow Diagram

```
┌──────────────┐
│  Cart Items  │
└──────┬───────┘
       │
       │ user._id
       │ cart items
       │ cart totals
       ↓
┌─────────────────────────────────────┐
│  CheckoutFlow                       │
│  (Step Management)                  │
└──────┬─────────────────────────────┘
       │
       ├─→ ShippingAddressStep
       │   └─→ CheckoutContext.updateShippingAddress()
       │
       ├─→ ReviewOrderStep
       │   └─→ Display cart + address
       │
       └─→ PaymentMethodStep
           └─→ Build Order Payload:
               {
                 customerId: user._id,
                 items: cart.items,
                 idempotencyKey: uuid
               }
               ↓
               POST /api/orders
               ↓
               ✓ Success
               ├─→ clearCart()
               ├─→ resetCheckout()
               └─→ Navigate to /order-success
                   ├─→ Pass orderData
                   └─→ Show success page
```

---

## 4. Form Validation Flow

```
┌──────────────────────────────────────────────────┐
│  User Input in ShippingAddressStep              │
└──────────┬───────────────────────────────────────┘
           │
           ├─→ User types in field
           │
           ├─→ handleChange()
           │   ├─→ Update formData
           │   └─→ Clear error for that field
           │
           │ (error clears while typing)
           │
           └─→ User clicks Continue
               │
               ├─→ validateForm()
               │   ├─ Check fullName: required
               │   ├─ Check phone: 10-digit
               │   ├─ Check email: email format
               │   ├─ Check street: required
               │   ├─ Check city: required
               │   ├─ Check state: selected
               │   ├─ Check pinCode: 6-digit
               │   └─ Return errors object
               │
               ├─ Has Errors?
               │   ├─ YES → Display errors
               │   │        Show red borders
               │   │        Keep user on Step 1
               │   │
               │   └─ NO → Save to CheckoutContext
               │           Go to Step 2
               │
               └─→ updateShippingAddress()
                   └─→ Navigate to Step 2
```

---

## 5. Price Calculation Flow

```
Cart Items:
├─ Item 1: price_cents=999900, qty=2
└─ Item 2: price_cents=499900, qty=1

Calculation:
├─ Subtotal = (999900 × 2) + (499900 × 1)
│            = 1999800 + 499900
│            = 2499700 cents
│            = ₹24,997
│
├─ Shipping = 0 (Complimentary)
│
├─ Tax (8%) = round(2499700 × 0.08)
│           = 199976 cents
│           = ₹1,999.76 → ₹2,000 (rounded)
│
└─ Total = 2499700 + 199976
         = 2699676 cents
         = ₹26,996.76 → ₹26,997 (displayed)

Display (Review Page):
├─ Subtotal:     ₹24,997
├─ Shipping:     Complimentary
├─ Tax (8%):     ₹2,000
└─ Grand Total:  ₹26,997
```

---

## 6. Step Navigation Logic

```
User Position Tracking:

Step 1 (Shipping Address)
├─ Buttons: [Back to Cart] [Continue]
├─ Back: window.history.back() → /cart
└─ Continue: 
   ├─ Validate form
   ├─ Save to CheckoutContext
   └─ setStep(2) → Step 2 renders

Step 2 (Review Order)
├─ Buttons: [Back] [Continue]
├─ Back:
   └─ setStep(1) → Step 1 renders
└─ Continue:
   └─ setStep(3) → Step 3 renders

Step 3 (Payment)
├─ Buttons: [Back] [Place Order]
├─ Back:
   └─ setStep(2) → Step 2 renders
└─ Place Order:
   ├─ POST /api/orders
   ├─ clearCart()
   ├─ resetCheckout()
   └─ navigate("/order-success", { state: { orderData } })

Order Success Page (/order-success)
├─ Shows order details
├─ No back navigation (new endpoint)
└─ Buttons:
   ├─ View My Orders → /orders
   └─ Continue Shopping → /products
```

---

## 7. API Integration Points

```
┌────────────────────────────────────────────────────┐
│  POST /api/orders                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  Called From: PaymentMethodStep.jsx                │
│  When: "Place Order" button clicked                │
│  Auth: Required (ProtectedRoute)                   │
│                                                    │
│  REQUEST PAYLOAD:                                  │
│  {                                                 │
│    customerId: "507f1f77bcf86cd799439011",        │
│    items: [                                        │
│      {                                             │
│        productId: "507f1f77bcf86cd799439012",     │
│        quantity: 2,                                │
│        title: "Product Name",                      │
│        unitPrice: 49999                            │
│      }                                             │
│    ],                                              │
│    idempotencyKey: "550e8400-e29b-41d4-a716..."  │
│  }                                                 │
│                                                    │
│  EXPECTED RESPONSE:                                │
│  {                                                 │
│    success: true,                                  │
│    order: {                                        │
│      _id: "507f1f77bcf86cd799439013",             │
│      status: "PENDING",                            │
│      customer: { id, name, email },               │
│      items: [...],                                 │
│      subtotal_minor: 99998,                        │
│      shipping_minor: 0,                            │
│      tax_minor: 7999,                              │
│      total_minor: 107997                           │
│    }                                               │
│  }                                                 │
│                                                    │
│  ERROR RESPONSE:                                   │
│  {                                                 │
│    success: false,                                 │
│    error: "Order creation failed",                │
│    message: "..."                                  │
│  }                                                 │
│                                                    │
│  AFTER SUCCESS:                                    │
│  ├─ Cart cleared: clearCart()                      │
│  ├─ Checkout reset: resetCheckout()               │
│  ├─ Order stored: setOrderData(response.order)    │
│  └─ Navigate: /order-success                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 8. State Management Timeline

```
Timeline: User journey through checkout

T0: User in /checkout
    CheckoutContext = {
      shippingAddress: { all empty },
      paymentMethod: "cod",
      orderData: null
    }

T1: User fills shipping address, clicks Continue
    CheckoutContext = {
      shippingAddress: { 
        fullName: "John Doe",
        phone: "9876543210",
        email: "john@example.com",
        street: "123 Main Street",
        city: "Bangalore",
        state: "Karnataka",
        pinCode: "560001",
        country: "India"
      },
      paymentMethod: "cod",
      orderData: null
    }

T2: User reviews order, clicks Continue
    (No change to CheckoutContext)

T3: User selects payment method
    CheckoutContext = {
      shippingAddress: { ... same },
      paymentMethod: "cod",  // or "online"
      orderData: null
    }

T4: User clicks "Place Order"
    API Call → Order created in DB

T5: Success response received
    CheckoutContext = {
      shippingAddress: { ... same },
      paymentMethod: "cod",
      orderData: { _id, items, totals, ... }
    }
    
    Then: resetCheckout() called
    CheckoutContext = {
      shippingAddress: { all empty },
      paymentMethod: "cod",
      orderData: null
    }

T6: User on /order-success
    Receives orderData via location.state
    (Not stored in context, just displayed)
```

---

## 9. File Dependency Tree

```
App.jsx (entry point)
├── CheckoutProvider (wrapper)
│   └── CheckoutContext.jsx
│
├── CartProvider (wrapper)
│   └── CartContext.jsx
│
├── UserProvider (wrapper)
│   └── UserContext.jsx
│
└── Routes
    ├── /checkout → CheckoutFlow.jsx
    │   ├── CheckoutContext (useCheckout)
    │   ├── CartContext (useCart)
    │   ├── UserContext (useUser)
    │   │
    │   ├─ Step 1: ShippingAddressStep.jsx
    │   │  └── CheckoutContext
    │   │
    │   ├─ Step 2: ReviewOrderStep.jsx
    │   │  ├── CheckoutContext
    │   │  └── CartContext
    │   │
    │   └─ Step 3: PaymentMethodStep.jsx
    │      ├── CheckoutContext
    │      ├── CartContext
    │      ├── UserContext
    │      └── api.js (POST /orders)
    │
    └── /order-success → OrderSuccess.jsx
        └── React Router (location.state)
```

---

## 10. Mobile vs Desktop Layout

```
DESKTOP (1024px+):
┌──────────────────────────────────────┐
│         Step Indicator               │
├──────────────────────┬────────────────┤
│                      │                │
│   Form (Left)        │  Sidebar       │
│   ┌─────────────────┐│ (Right)        │
│   │                 ││ ┌────────────┐ │
│   │  [Form Fields]  ││ │  Summary   │ │
│   │                 ││ │  ┌──────┐  │ │
│   │                 ││ │  │Items │  │ │
│   │  [Buttons]      ││ │  ├──────┤  │ │
│   │                 ││ │  │Totals│  │ │
│   └─────────────────┘│ │  └──────┘  │ │
│                      │ └────────────┘ │
└──────────────────────┴────────────────┘

TABLET (768px-1023px):
┌──────────────────────────────────────┐
│         Step Indicator               │
├──────────────────────────────────────┤
│                                      │
│        Form (Full Width)             │
│   ┌──────────────────────────────┐   │
│   │                              │   │
│   │      [Form Fields]           │   │
│   │                              │   │
│   │      [Buttons]               │   │
│   └──────────────────────────────┘   │
│                                      │
│        Summary (Below)               │
│   ┌──────────────────────────────┐   │
│   │      [Summary Card]          │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘

MOBILE (375px-767px):
┌──────────────────────┐
│  Step Indicator      │
│  (Stacked)           │
├──────────────────────┤
│                      │
│  Form                │
│  ┌──────────────────┐│
│  │                  ││
│  │ [Form Fields]    ││
│  │                  ││
│  │ [Buttons]        ││
│  └──────────────────┘│
│                      │
│  Summary             │
│  ┌──────────────────┐│
│  │  [Items]         ││
│  │  [Totals]        ││
│  └──────────────────┘│
│                      │
└──────────────────────┘
```

---

## 11. Error Handling Flow

```
User Action
    ↓
Try Block
├─ Validate input
├─ Build payload
├─ Make API call
│   ├─ Success → Process response
│   └─ Error → Catch block
│
Catch Block
├─ Check error.response?.data?.message
├─ Check error.response?.data?.error
├─ Fallback message
│
Display Error
├─ Set state: setError(message)
├─ Show error card (red background)
├─ Show specific error message
├─ Keep user on current step
└─ Allow retry (resubmit form)

User can:
├─ Read error message
├─ Fix the issue
└─ Try again (click button again)
```

---

## 12. Animation Sequence

```
CheckoutFlow Load
    ↓
┌─ Animate In
│  ├─ Step Indicator: opacity 0→1, y -20→0
│  └─ Main Content: opacity 0→1
│
Step Transition
└─ Animate Out + In
   ├─ Current Step: opacity 1→0, x 0→-20
   ├─ Delay 300ms
   └─ Next Step: opacity 0→1, x 20→0

OrderSuccess Page
├─ Success Animation: scale 0→1 (spring)
├─ Rotating border: 360° rotation
├─ Card fade in: opacity 0→1
└─ Each section:
   ├─ Delay 0.4s for title
   ├─ Delay 0.5s for details
   ├─ Delay 0.6s for amount
   ├─ Delay 0.7s for buttons
   └─ Delay 0.8s for info box
```

---

This visual guide provides a complete understanding of how the checkout flow works! 🎨
