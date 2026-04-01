# FoodBazar Firestore Schema Reference

## Collection: `orders/{orderId}`

POS (staff-facing) orders. Document IDs follow the format `ORD-001`, `ORD-002`, ... (padded to 3 digits).

| Field      | Type    | Example        | Notes                 |
| ---------- | ------- | -------------- | --------------------- |
| `id`       | String  | `"ORD-001"`    | Same as document ID   |
| `date`     | String  | `"2026-04-01"` | ISO `YYYY-MM-DD`      |
| `time`     | String  | `"12:34 PM"`   | en-PK locale          |
| `items`    | Number  | `5`            | Total item quantity   |
| `subtotal` | Number  | `2200`         | Before tax (PKR)      |
| `tax`      | Number  | `100`          | Tax amount            |
| `total`    | Number  | `2300`         | Including tax         |
| `isNew`    | Boolean | `true`         |                       |
| `itemList` | Array   | see below      | List of ordered items |

### `itemList` element shape

```json
{ "id": "k1", "name": "Chicken Karahi", "price": 1049, "qty": 2 }
```

---

## Document: `meta/orderCounter`

Single document. Tracks the incrementing POS order counter across devices.

| Field   | Type   | Example |
| ------- | ------ | ------- |
| `value` | Number | `42`    |

---

## Collection: `menu/{itemId}`

Menu items. Document IDs are short strings like `d1`, `b1`, `k1`, `p1`, etc.

| Field         | Type    | Example            | Notes                                      |
| ------------- | ------- | ------------------ | ------------------------------------------ |
| `cat`         | String  | `"karahi"`         | Category ID (see categories below)         |
| `name`        | String  | `"Chicken Karahi"` | Display name                               |
| `price`       | Number  | `1049`             | Present when `hasVariants` is absent/false |
| `hasVariants` | Boolean | `true`             | Optional field                             |
| `variants`    | Array   | see below          | Only present when `hasVariants` is true    |

### `variants` element shape

```json
{ "label": "Half", "price": 1049 }
```

### Category IDs

`desi`, `bbq`, `karahi`, `handi`, `pizza`, `chaat`, `burger`, `fries`, `salad`, `soup`, `hotcold`, `tandoor`

---

## Document: `config/app`

Single document at path `config/app`. Stores app-wide settings.

| Field     | Type   | Example       |
| --------- | ------ | ------------- |
| `taxRate` | Number | `5` (percent) |

---

## Collection: `customerOrders/{autoId}`

Customer-facing orders submitted through the customer ordering flow. Document ID is Firestore auto-generated.

| Field               | Type   | Example                   | Notes                                             |
| ------------------- | ------ | ------------------------- | ------------------------------------------------- |
| `id`                | String | `"abc123xyz"`             | Same as document ID                               |
| `customerSessionId` | String | `"cust_1743500000_x9k2z"` | Identifies the customer session                   |
| `customerName`      | String | `"Ahmed"`                 |                                                   |
| `tableLabel`        | String | `"Table 3"`               |                                                   |
| `notes`             | String | `"No spicy"`              |                                                   |
| `status`            | String | `"pending"`               | `pending` / `accepted` / `rejected` / `cancelled` |
| `source`            | String | `"customer-beta"`         | Always this value                                 |
| `date`              | String | `"2026-04-01"`            | ISO `YYYY-MM-DD`                                  |
| `time`              | String | `"07:30 PM"`              | en-PK locale                                      |
| `items`             | Number | `3`                       | Total item quantity                               |
| `subtotal`          | Number | `2000`                    | Before tax                                        |
| `tax`               | Number | `95`                      | Tax amount                                        |
| `total`             | Number | `2095`                    | Including tax                                     |
| `itemList`          | Array  | same shape as orders      |                                                   |
| `createdAt`         | Number | `1743500000000`           | Unix milliseconds timestamp                       |
| `updatedAt`         | Number | `1743500000000`           | Unix milliseconds timestamp                       |

### Customer Order Status Values

```
pending    → order submitted, waiting for staff to accept
accepted   → staff accepted the order
rejected   → staff rejected the order
cancelled  → customer cancelled the order
```

---
