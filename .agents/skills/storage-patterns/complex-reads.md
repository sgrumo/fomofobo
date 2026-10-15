## Shared select

If two or more reads in one storage class share the same joins or computed columns, write them once in a shared select. Reads on one table, or reads that share no joins, query the table directly as `SKILL.md` shows.

The shared select is a top-level function next to the mapper. It holds the `select`, the `from`, and the joins. Each read adds its own `where`, `orderBy`, and `limit`. The row type comes from the function, so the mapper follows each change of the select.

The example reads orders with their active customer, their optional assignee, and the count and the total of their lines. The lines are aggregated in a subquery, so each order stays one row.

```typescript
import { and, count, desc, eq, isNull, sum } from "drizzle-orm"

import type { DbSelect } from "../db-config"

/**
 * @description Builds the select of orders with customer, assignee and line totals
 * @param db Database the query runs on
 */
const selectOrderRows = (db: DbSelect) => {
    const lineTotals = db
        .select({
            orderId: orderLines.orderId,
            lineCount: count().as("line_count"),
            totalCents: sum(orderLines.amountCents).mapWith(Number).as("total_cents"),
        })
        .from(orderLines)
        .groupBy(orderLines.orderId)
        .as("line_totals")

    return db
        .select({
            order: orders,
            customerName: customers.name,
            assigneeName: users.name,
            lineCount: lineTotals.lineCount,
            totalCents: lineTotals.totalCents,
        })
        .from(orders)
        .innerJoin(
            customers,
            and(eq(orders.customerId, customers.id), isNull(customers.deletedAt)),
        )
        .leftJoin(users, eq(orders.assigneeId, users.id))
        .leftJoin(lineTotals, eq(orders.id, lineTotals.orderId))
}

type OrderRow = Awaited<ReturnType<typeof selectOrderRows>>[number]

/**
 * @description Maps a row of `selectOrderRows` to its model
 * @param row Order row with its joined and aggregated columns
 */
const toOrder = (row: OrderRow): Order => ({
    id: row.order.id,
    status: row.order.status,
    customerName: row.customerName,
    assigneeName: row.assigneeName,
    lineCount: row.lineCount ?? 0,
    totalCents: row.totalCents ?? 0,
})

export class OrderStorage {
    /**
     * @description Fetches one order, or `null` when no row matches
     * @param id Order read
     */
    public async getOrder(id: string): Promise<Order | null> {
        const [row] = await selectOrderRows(this.db).where(eq(orders.id, id))
        return row ? toOrder(row) : null
    }

    /**
     * @description Fetches the orders of one customer, newest first
     * @param customerId Customer owning the orders
     */
    public async listCustomerOrders(customerId: string): Promise<Order[]> {
        const rows = await selectOrderRows(this.db)
            .where(eq(orders.customerId, customerId))
            .orderBy(desc(orders.createdAt), orders.id)
        return rows.map(toOrder)
    }
}
```

- Name the function `select<Entity>Rows`, its row type `<Entity>Row`, and the mapper `to<Entity>`.
- Type the parameter `DbSelect`, so the function can only start a select. Pass `this.db` from a method.
- Never pass the `where` as a parameter of the shared select. The read chains it.
- A `leftJoin` makes each column of the joined table nullable. The mapper picks the fallback, as `lineCount ?? 0` does.
- If the shared select joins a one-to-many table directly, it returns one row per child. A `limit` or an `offset` then counts child rows and cuts a parent across two pages. Aggregate the children in a subquery, as `lineTotals` does, or into one column with `json_group_array`, so each parent stays one row. Otherwise, page the parent ids first, then read the shared select for those ids.
