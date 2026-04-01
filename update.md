# Flutter POS Update

## Goal

Implement the **customer ordering beta** on the **POS side** of the Flutter app so it behaves like the current web/Electron version.

This update is only for the **POS/staff app**. The POS should:

- listen for customer-created orders from Firebase
- show them in a dedicated live queue
- let staff `Accept`, `Reject`, or `Cancel`
- convert accepted customer orders into normal POS orders
- remove accepted POS orders if the related customer order is later canceled
- respect the Firebase Remote Config beta flag

---

## Firebase Model

### Remote Config flag

Use:

`customer_ordering_beta_enabled`

Behavior:

- if `false`: hide the customer-ordering queue on the POS
- if `true`: show the live customer-order queue

Recommended:

- fetch Remote Config on app start
- refresh on app resume / foreground
- keep a local default of `false`

---

## Realtime Database structure

Use the same `customerOrders` collection/path already used by the web app:

`foodbazar/customerOrders`

Each customer order should support at least:

```json
{
  "id": "firebase-push-id",
  "customerSessionId": "cust_xxx",
  "customerName": "Ali",
  "tableLabel": "Table 4",
  "notes": "Less spicy",
  "status": "pending",
  "source": "customer-beta",
  "date": "2026-03-30",
  "time": "08:15 PM",
  "items": 3,
  "subtotal": 1200,
  "tax": 60,
  "total": 1260,
  "itemList": [
    { "id": "b1", "name": "Chicken Burger", "price": 450, "qty": 2 }
  ],
  "createdAt": 1711820000000,
  "updatedAt": 1711820000000,
  "estimatedReadyMinutes": 20,
  "decisionAt": 1711820100000,
  "acceptedOrderId": "ORD-021",
  "cancelledAt": 1711820200000,
  "cancelledBy": "restaurant",
  "statusMessage": "Accepted · 20 min"
}
```

### Status values

Support these exact values:

- `pending`
- `accepted`
- `rejected`
- `cancelled`

---

## POS-side behavior

### 1. Listen to live customer orders

Create a realtime listener for:

`foodbazar/customerOrders`

Sort newest first by `createdAt`.

For the POS queue, only show:

- `pending`
- `accepted`

Do not show:

- `rejected`
- `cancelled`

---

### 2. POS queue UI

Add a new section on the POS dashboard:

`Live Customer Orders`

Each card should show these labeled headers:

- `Customer`
- `Table`
- `Status`
- `Order`
- `Details`
- `Total`

Example layout:

- `Customer`: Ali
- `Table`: Table 4
- `Status`: Pending / Accepted
- `Order`: 2x Chicken Burger, 1x Fries
- `Details`: push-id / time / item count / prep time
- `Total`: Rs 1260

### Card actions

If status is `pending`:

- choose estimated prep time
- `Accept`
- `Reject`

If status is `accepted`:

- show accepted state
- allow `Cancel Order`

---

## Action rules

### Accept

When staff accepts a customer order:

1. create a normal POS order in the standard POS orders list
2. save its generated POS order id into `acceptedOrderId`
3. update customer order:

```json
{
  "status": "accepted",
  "estimatedReadyMinutes": 20,
  "decisionAt": 1711820100000,
  "acceptedOrderId": "ORD-021",
  "statusMessage": "Accepted · 20 min"
}
```

### Reject

When staff rejects:

```json
{
  "status": "rejected",
  "estimatedReadyMinutes": null,
  "decisionAt": 1711820100000,
  "statusMessage": "Rejected by restaurant"
}
```

### Cancel from POS

If a customer order is already accepted and staff cancels it:

1. remove the linked POS order using `acceptedOrderId`
2. update customer order:

```json
{
  "status": "cancelled",
  "estimatedReadyMinutes": null,
  "cancelledAt": 1711820200000,
  "cancelledBy": "restaurant",
  "statusMessage": "Cancelled by restaurant"
}
```

If the order is still `pending`, cancellation should still mark it as `cancelled`.

---

## POS order linking

Accepted customer orders must become normal POS orders so they appear in:

- order history
- sales totals
- dashboard analytics
- admin reports

When creating the POS order, also store metadata:

```json
{
  "source": "customer-beta",
  "customerOrderId": "firebase-push-id",
  "customerName": "Ali",
  "tableLabel": "Table 4",
  "customerNotes": "Less spicy"
}
```

This makes reverse lookup easy if the order is canceled later.

---

## Countdown on POS

For `accepted` customer orders, show a live countdown based on:

- `decisionAt`
- `estimatedReadyMinutes`

Formula:

- `endTime = decisionAt + estimatedReadyMinutes`
- `remaining = endTime - now`

UI suggestion:

- timer text like `14:32`
- small progress bar
- if remaining <= 0, show a completed/ready state

This is optional for the queue card, but recommended for parity.

---

## State management suggestion

If using `Provider`, `Riverpod`, or `Bloc`, keep the logic in one place:

- `remoteConfigProvider` / service
- `customerOrdersStreamProvider` / bloc
- `posOrdersProvider` / bloc

Recommended methods:

- `Future<bool> isCustomerOrderingEnabled()`
- `Stream<List<CustomerOrder>> watchLiveCustomerOrders()`
- `Future<void> acceptCustomerOrder(CustomerOrder order, int etaMinutes)`
- `Future<void> rejectCustomerOrder(String customerOrderId)`
- `Future<void> cancelCustomerOrderFromPos(CustomerOrder order)`

---

## Suggested Flutter models

### CustomerOrder

Fields:

- `id`
- `customerSessionId`
- `customerName`
- `tableLabel`
- `notes`
- `status`
- `source`
- `date`
- `time`
- `items`
- `subtotal`
- `tax`
- `total`
- `itemList`
- `createdAt`
- `updatedAt`
- `estimatedReadyMinutes`
- `decisionAt`
- `acceptedOrderId`
- `cancelledAt`
- `cancelledBy`
- `statusMessage`

### PosOrder

Make sure it supports:

- `source`
- `customerOrderId`
- `customerName`
- `tableLabel`
- `customerNotes`

---

## Validation / safety

- only allow `Accept` if order is currently `pending`
- only allow `Reject` if order is currently `pending`
- only allow `Cancel` if order is `pending` or `accepted`
- guard against duplicate accepts
- if `acceptedOrderId` exists and order is canceled, remove that POS order too
- always update `updatedAt`

---

## Testing checklist

- Remote Config `false` hides the customer-order queue
- Remote Config `true` shows the queue
- new customer `pending` order appears live on POS
- POS can accept with ETA
- accepted order becomes a normal POS order
- POS can reject
- POS can cancel pending order
- POS can cancel accepted order
- canceling accepted order also removes linked POS order
- accepted order countdown updates correctly
- queue never shows rejected/cancelled orders as active

---

## Minimum delivery scope

If doing this in phases, build in this order:

1. Remote Config gate
2. live Firebase listener for customer orders
3. POS queue UI with headers
4. Accept + Reject
5. create linked normal POS order on Accept
6. Cancel from POS
7. countdown / progress UI

---

## Notes for parity with current web version

Current web behavior already supports:

- Remote Config flag gating
- live POS queue
- labeled customer/order info
- accept / reject / cancel
- accepted order -> normal POS order conversion
- cancellation sync across both sides

The Flutter POS app should mirror that behavior as closely as possible.
