# Component Reference Guide

## Component Hierarchy

```
App.jsx
├── BrowserRouter
├── WishlistProvider
├── UserProvider
├── CartProvider
├── CheckoutProvider ← NEW
└── ToastProvider
    │
    └── Routes
        ├── /checkout → CheckoutFlow ← NEW
        │   ├── Step Indicator (visual progress)
        │   ├── Step Content (animated)
        │   │   ├── ShippingAddressStep ← NEW (Step 1)
        │   │   ├── ReviewOrderStep ← NEW (Step 2)
        │   │   └── PaymentMethodStep ← NEW (Step 3)
        │   └── Order Summary (sticky sidebar)
        │
        └── /order-success → OrderSuccess ← NEW
```

---

## 🏗️ Context: CheckoutContext

**File:** `src/context/CheckoutContext.jsx`

### State Structure
```javascript
checkoutData = {
  shippingAddress: {
    fullName: string,
    phone: string,
    email: string,
    street: string,
    city: string,
    state: string,
    pinCode: string,
    country: string (default: "India")
  },
  paymentMethod: "cod" | "online",
  orderData: object | null
}
```

### Hooks
```javascript
// Usage: const { checkoutData, updateShippingAddress, ... } = useCheckout();

useCheckout() → {
  checkoutData,                    // Current state
  updateShippingAddress(address),  // Update address fields
  setPaymentMethod(method),        // Set payment method
  setOrderData(data),              // Store order response
  resetCheckout()                  // Clear all data
}
```

### Provider
```javascript
<CheckoutProvider>
  {/* All child components have access to useCheckout() */}
</CheckoutProvider>
```

---

## 📄 Component: CheckoutFlow

**File:** `src/pages/CheckoutFlow.jsx`

### Purpose
Main orchestrator page that manages:
- Step navigation
- Step indicator display
- Order summary sidebar
- Step transitions

### Props
None (uses hooks internally)

### State Management
```javascript
const [step, setStep] = useState(1);              // Current step (1-3)
const [validationErrors, setValidationErrors] = useState({});
```

### Hooks Used
```javascript
const { cart } = useCart();                    // Get cart items
const { checkoutData } = useCheckout();        // Get checkout state
const { user } = useUser();                    // Get user info
const navigate = useNavigate();                // Navigate routes
```

### Renders
- Step Indicator (shows progress 1-4)
- Current Step Component (animated)
- Order Summary Sidebar (sticky)

### Key Features
✅ Visual step indicator with checkmarks
✅ Animated transitions between steps
✅ Responsive: 2-column desktop, 1-column mobile
✅ Sticky sidebar on desktop
✅ Handles back to cart redirect

---

## 📍 Component: ShippingAddressStep

**File:** `src/pages/checkout/ShippingAddressStep.jsx`

### Purpose
Collect and validate shipping address information.

### Props
```javascript
{
  onContinue: () => void,                    // Called when continue button clicked
  errors: { [fieldName]: string },           // Validation errors
  setErrors: (errors) => void                // Update errors
}
```

### State Management
```javascript
const [formData, setFormData] = useState(     // Form field values
  checkoutData.shippingAddress
);
```

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| fullName | text | ✅ | Required, min 2 chars |
| phone | tel | ✅ | 10-digit number |
| email | email | ✅ | Valid email format |
| street | text | ✅ | Required, min 5 chars |
| city | text | ✅ | Required |
| state | select | ✅ | 28 Indian states |
| pinCode | text | ✅ | 6-digit number |
| country | text | ❌ | Fixed: "India" |

### Validation Logic
```javascript
validateForm() → {
  fullName: "Full name is required"
  phone: "Valid 10-digit phone number is required"
  email: "Valid email is required"
  street: "Street address is required"
  city: "City is required"
  state: "State is required"
  pinCode: "Valid 6-digit PIN code is required"
}
```

### Hooks Used
```javascript
const { checkoutData, updateShippingAddress } = useCheckout();
```

### Buttons
- **Back to Cart** - Window history back
- **Continue** - Validate and proceed to Step 2

### Key Features
✅ Real-time error clearing
✅ Red styling for error fields
✅ Error icons (AlertCircle)
✅ State dropdown with all Indian states
✅ Phone/PIN number formatting
✅ Back button returns to /cart

---

## 📋 Component: ReviewOrderStep

**File:** `src/pages/checkout/ReviewOrderStep.jsx`

### Purpose
Display order details for final review before payment.

### Props
```javascript
{
  onContinue: () => void,  // Proceed to payment step
  onBack: () => void       // Return to shipping step
}
```

### Hooks Used
```javascript
const { cart } = useCart();              // Get items and prices
const { checkoutData } = useCheckout();  // Get address data
```

### Displays

#### Cart Items
- Product image (thumbnail)
- Product name (line-clamped to 2 lines)
- Quantity
- Individual price
- Subtotal

#### Price Summary
- Subtotal (sum of all items)
- Shipping (shows "Complimentary")
- Tax (8% of subtotal)
- **Total** (large, prominent)

#### Shipping Address Card
- Full Name
- Street Address
- City, State, PIN
- Country
- Phone
- Email
- Edit Address button

#### Estimated Delivery
- Truck icon
- Delivery date (4 days from now)
- Formatted: "Monday, July 26, 2026"
- "Free shipping on this order" message

### Calculations
```javascript
subtotalCents = sum(item.unitPriceCents * item.quantity)
taxCents = round(subtotalCents * 0.08)
totalCents = subtotalCents + taxCents
deliveryDate = now + 4 days
```

### Buttons
- **Back** - Return to Step 1
- **Choose Payment** - Proceed to Step 3

### Key Features
✅ Shows all cart items with images
✅ Complete price breakdown
✅ Address confirmation
✅ Estimated delivery date
✅ Edit address option
✅ Green complimentary shipping badge

---

## 💳 Component: PaymentMethodStep

**File:** `src/pages/checkout/PaymentMethodStep.jsx`

### Purpose
Select payment method and create order.

### Props
```javascript
{
  onBack: () => void       // Return to review step
}
```

### State Management
```javascript
const [paymentMethod, setPaymentMethod] = useState("cod");
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Hooks Used
```javascript
const { cart, clearCart, subtotalCents, shippingCents, taxCents, totalCents } = useCart();
const { checkoutData, resetCheckout } = useCheckout();
const { user } = useUser();
const navigate = useNavigate();
```

### Payment Methods
```javascript
[
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your order is delivered",
    icon: "💵",
    enabled: true
  },
  {
    id: "online",
    name: "Online Payment",
    description: "Credit/Debit Card or UPI",
    icon: "💳",
    enabled: false  // disabled/placeholder
  }
]
```

### Order Creation Logic
```javascript
// When "Place Order" is clicked:
1. Validate cart has items
2. Build order payload:
   - customerId: user._id or user.id or ""
   - items: [{ productId, quantity, title, unitPrice }]
   - idempotencyKey: UUID
3. POST /api/orders
4. On success:
   - Store order data
   - Clear cart: clearCart()
   - Reset checkout: resetCheckout()
   - Navigate to /order-success
5. On error:
   - Display error message
   - Keep user on step 3
```

### Error Handling
```javascript
catch (err) {
  error = err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to place order. Please try again."
}
```

### Displays
- Payment method selector (radio buttons)
- Order summary (readonly)
- Safety message card (green badge)
- Error message card (if error occurs)

### Buttons
- **Back** - Return to Step 2
- **Place Order** - Create order via API (shows loading spinner)

### Key Features
✅ Radio button selection
✅ COD enabled by default
✅ Online Payment placeholder
✅ Idempotency key prevents duplicates
✅ Loading spinner during API call
✅ Error message display
✅ **CRITICAL:** Only "Place Order" here creates order

---

## ✅ Component: OrderSuccess

**File:** `src/pages/OrderSuccess.jsx`

### Purpose
Display order confirmation with details and next steps.

### Props
None (receives orderData via location.state)

### Data Expected
```javascript
orderData = {
  orderId: string,           // MongoDB _id
  date: string,              // Format: "DD/MM/YYYY"
  paymentMethod: string,     // "Cash on Delivery" or "Online Payment"
  shippingAddress: {
    fullName: string,
    street: string,
    city: string,
    state: string,
    pinCode: string,
    phone: string,
    email: string
  },
  totalAmount: number,       // In INR (not cents)
  estimatedDelivery: string  // Format: "Monday, July 26, 2026"
}
```

### Hooks Used
```javascript
const location = useLocation();           // Get orderData
const navigate = useNavigate();           // Navigate to other pages
```

### Layout
```
┌─ Success Animation ─┐
│ (Spinning checkmark) │
├─ Main Card ────────┤
│ Header (gradient)   │
│ Order ID            │
│ Order Date          │
│                     │
│ 2-Column Grid:      │
│ ├─ Address Card     │
│ ├─ Delivery Card    │
│ ├─ Payment Card     │
│ └─ Amount Card      │
│                     │
│ Action Buttons      │
│ Info Box            │
└─────────────────────┘
```

### Animations
```javascript
- Success checkmark: Scale 0→1 (spring animation)
- Rotating border: 360° rotation
- Main card: Fade + slide up
- Each section: Cascading animation delays
```

### Displays

#### Success Animation
- Rotating circular border
- CheckCircle2 icon (green)
- Scale animation: 0 → 1

#### Order Confirmation
- "Order Confirmed!" heading
- Green gradient background
- "Thank you for your purchase" subheading

#### Order Details
**Grid (2 columns on desktop, 1 on mobile)**
- Shipping Address (blue card with pin icon)
- Estimated Delivery (green card with truck icon)
- Payment Method (purple card with card icon)
- Total Amount (gray card, large amount)

#### Information Box
- Blue background with info icon
- "Next Steps" heading
- Email confirmation message
- Link to contact support

### Buttons
- **View My Orders** - Navigate to /orders
- **Continue Shopping** - Navigate to /products
- **Contact Support** - Link (placeholder)

### Key Features
✅ Success animation (spinning + scaling)
✅ Gradient header
✅ Color-coded information cards
✅ Large, prominent order ID
✅ Complete order summary
✅ Email confirmation notification
✅ Easy navigation to next steps
✅ Responsive design

---

## 🔄 Data Flow

### Journey Through Components

```
1. User in /cart
   └─ Clicks "Proceed to Checkout"

2. Router → /checkout
   └─ CheckoutFlow renders
       ├─ Loads Step 1: ShippingAddressStep
       ├─ User enters address
       └─ Clicks "Continue"

3. CheckoutFlow updates step to 2
   └─ ShippingAddressStep saves to CheckoutContext
   └─ ReviewOrderStep renders
       ├─ Shows cart items
       ├─ Shows saved address
       └─ Clicks "Continue"

4. CheckoutFlow updates step to 3
   └─ PaymentMethodStep renders
       ├─ Shows payment options
       ├─ COD selected (default)
       └─ Clicks "Place Order"

5. PaymentMethodStep
   └─ Calls API: POST /api/orders
       ├─ Sends customerId, items, idempotencyKey
       ├─ Backend creates order
       └─ Returns { success: true, order }

6. On Success
   └─ clearCart() - empty CartContext
   └─ resetCheckout() - clear CheckoutContext
   └─ navigate("/order-success", { state: { orderData } })

7. OrderSuccess renders
   └─ Shows order confirmation
   └─ Displays all order details
   └─ User can:
       ├─ "View My Orders" → /orders
       └─ "Continue Shopping" → /products
```

---

## 🎯 Integration Points

### With UserContext
```javascript
// In PaymentMethodStep
const { user } = useUser();
// Use: user._id for customerId in order
```

### With CartContext
```javascript
// In CheckoutFlow, ReviewOrderStep, PaymentMethodStep
const { cart, clearCart, subtotalCents, taxCents, totalCents } = useCart();
// Use: cart items for display
// Use: totals for calculations
// Use: clearCart() after successful order
```

### With Router
```javascript
// Navigation between steps
const navigate = useNavigate();
navigate("/order-success", { state: { orderData } });

// Back to cart
window.history.back();
```

### With API
```javascript
// In PaymentMethodStep
const response = await api.post("/orders", payload);
// Expected response: { success, order }
```

---

## 📦 Import Structure

### Main Component Imports
```javascript
import CheckoutFlow from "./pages/CheckoutFlow";
import OrderSuccess from "./pages/OrderSuccess";
```

### Step Component Imports (in CheckoutFlow)
```javascript
import ShippingAddressStep from "./checkout/ShippingAddressStep";
import ReviewOrderStep from "./checkout/ReviewOrderStep";
import PaymentMethodStep from "./checkout/PaymentMethodStep";
```

### Context Imports (in all components)
```javascript
import { useCheckout } from "../context/CheckoutContext";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
```

### UI Library Imports
```javascript
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, MapPin, ... } from "lucide-react";
import { formatINR } from "../utils/currency";
```

---

## 🎨 Styling Patterns

### Form Input Classes
```javascript
// Normal state
w-full px-4 py-3 border rounded-lg font-medium outline-none 
transition-all border-gray-300 bg-white focus:border-black focus:ring-1

// Error state
border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500
```

### Button Classes
```javascript
// Primary (Continue/Place Order)
px-6 py-4 bg-black text-white font-bold uppercase tracking-wider 
rounded-lg transition-all hover:bg-gray-900

// Secondary (Back)
px-6 py-4 border-2 border-gray-300 text-black font-bold uppercase 
rounded-lg transition-all hover:border-black hover:bg-gray-50
```

### Card Classes
```javascript
bg-white rounded-2xl p-8 border border-gray-200
```

---

## ✨ Export/Import Checklist

All components properly exported as default exports:

```javascript
// ✅ CheckoutContext.jsx
export const useCheckout = () => { ... }
export const CheckoutProvider = ({ children }) => { ... }

// ✅ CheckoutFlow.jsx
export default CheckoutFlow;

// ✅ ShippingAddressStep.jsx
export default ShippingAddressStep;

// ✅ ReviewOrderStep.jsx
export default ReviewOrderStep;

// ✅ PaymentMethodStep.jsx
export default PaymentMethodStep;

// ✅ OrderSuccess.jsx
export default OrderSuccess;
```

---

## 📊 Component Stats

| Component | Lines | Props | State | Hooks |
|-----------|-------|-------|-------|-------|
| CheckoutContext | 65 | 0 | 1 | - |
| CheckoutFlow | 180 | 0 | 2 | 4 |
| ShippingAddressStep | 220 | 3 | 1 | 1 |
| ReviewOrderStep | 150 | 2 | 0 | 2 |
| PaymentMethodStep | 200 | 1 | 3 | 4 |
| OrderSuccess | 200 | 0 | 0 | 2 |

---

This reference guide covers all components, their structure, and how they work together! 🚀
