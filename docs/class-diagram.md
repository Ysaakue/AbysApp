# Class Diagram — AbysApp

Generated from `prisma/schema.prisma`.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLASS DIAGRAM                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    User     │         │   ServiceOrder   │         │    Customer      │
├─────────────┤         ├──────────────────┤         ├──────────────────┤
│ id: Int (PK)│         │ id: Int (PK)     │         │ id: Int (PK)     │
│ name        │◄────────│ createdById (FK) │         │ name             │
│ email       │         │ customerId (FK)──┼─────────► phone            │
│ password    │         │ deviceId (FK)    │         │ email?           │
│ active      │         │ statusId (FK)    │         │ createdAt        │
│ createdAt   │         │ problemDescr.    │         └──────────────────┘
└─────────────┘         │ createdAt        │
       │                │ completedAt?     │
       │ (comments)     └──────────────────┘
       │                       │
       │              ┌────────┼─────────┐
       │              │        │         │
       ▼              ▼        ▼         ▼
┌─────────────┐ ┌───────────┐ ┌───────────────┐
│   Comment   │ │OrderSvc   │ │ OrderPartItem │
├─────────────┤ │   Item    │ ├───────────────┤
│ id: Int (PK)│ ├───────────┤ │ id: Int (PK)  │
│ orderId(FK) │ │id: Int(PK)│ │ orderId (FK)  │
│ authorId(FK)│ │orderId(FK)│ │ partId (FK)   │
│ text        │ │serviceId  │ │ unitPrice     │
│ createdAt   │ │unitPrice  │ │ quantity      │
└─────────────┘ │quantity   │ └───────────────┘
                └─────┬─────┘         │
                      │               │ 1
                      │               ▼
                 ┌─────────┐   ┌──────────────────┐
                 │ Service │   │  StockMovement   │
                 ├─────────┤   ├──────────────────┤
                 │id:Int PK│   │ id: Int (PK)     │
                 │ name    │   │ partId (FK)      │
                 │ descr.? │   │ orderPartItemId? │ (null = manual)
                 │ price   │   │ type: IN | OUT   │
                 └─────────┘   │ quantity         │
                               │ price            │
                               │ notes? (50 chr)  │
                               │ createdAt        │
                               └──────────────────┘
                                        │
                                        │ N
                               ┌────────┴──────┐
                               │     Part      │
                               ├───────────────┤
                               │ id: Int (PK)  │
                               │ name          │
                               │ description?  │
                               │ price         │
                               └───────────────┘

┌──────────────┐         ┌──────────────┐
│   Device     │         │ OrderStatus  │
├──────────────┤         ├──────────────┤
│ id: Int (PK) │         │ id: Int (PK) │
│ brand        │         │ name (unique)│
│ model        │         │ color?       │
│ notes?       │         └──────────────┘
└──────────────┘
```

## Entity Relationships

| From | Relationship | To | Foreign Key |
|---|---|---|---|
| `ServiceOrder` | Many-to-One | `Customer` | `customerId` |
| `ServiceOrder` | Many-to-One | `Device` | `deviceId` |
| `ServiceOrder` | Many-to-One | `OrderStatus` | `statusId` |
| `ServiceOrder` | Many-to-One | `User` | `createdById` |
| `ServiceOrder` | One-to-Many | `OrderServiceItem` | `orderId` |
| `ServiceOrder` | One-to-Many | `OrderPartItem` | `orderId` |
| `ServiceOrder` | One-to-Many | `Comment` | `orderId` |
| `OrderServiceItem` | Many-to-One | `Service` | `serviceId` |
| `OrderPartItem` | Many-to-One | `Part` | `partId` |
| `OrderPartItem` | One-to-One (opt.) | `StockMovement` | `orderPartItemId` |
| `StockMovement` | Many-to-One | `Part` | `partId` |
| `Comment` | Many-to-One | `User` | `authorId` |

## Notes on Key Relationships

- **`OrderServiceItem.unitPrice`** and **`OrderPartItem.unitPrice`** are snapshots taken at the moment the item is added to an order. They are independent of `Service.price` and `Part.price` and can be edited per-order without affecting the catalog.

- **`StockMovement.orderPartItemId`** is optional (`?`). When set, it links the movement to a specific order item (auto-created `OUT`). When `null`, it is a manual entry (IN or OUT). Cascade-deleting an `OrderPartItem` deletes the linked `StockMovement`, restoring stock.
