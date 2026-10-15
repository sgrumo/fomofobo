import { cn } from "frontend-shared/styles"
import { FallbackBox } from "ui-components/fallback-box"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "ui-components/table"

interface TableShowcaseProps {
    className?: string
}
export const TableShowcase = (props: TableShowcaseProps) => (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2", props.className)}>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Standard (few rows)</p>
            <TableStandardShowcase />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Empty (fallback)</p>
            <TableEmptyShowcase />
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Standard (20 rows)</p>
            <div className="max-h-[25rem] overflow-auto">
                <TableManyRowsShowcase />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="tp-pixel-lg">Long content</p>
            <TableLongContentShowcase />
        </div>
    </div>
)

const TableStandardShowcase = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[25%]">Role</TableHead>
                <TableHead className="w-[30%]">Email</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody showEmptyFallback={false}>
            {fewRows.map(row => (
                <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.status}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

const TableEmptyShowcase = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[25%]">Role</TableHead>
                <TableHead className="w-[30%]">Email</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody
            showEmptyFallback={true}
            emptyFallback={
                <div className="py-12">
                    <FallbackBox type="empty" title="No users found" />
                </div>
            }
        />
    </Table>
)

const TableManyRowsShowcase = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[10%]">#</TableHead>
                <TableHead className="w-[25%]">Product</TableHead>
                <TableHead className="w-[25%]">Category</TableHead>
                <TableHead className="w-[20%]">Price</TableHead>
                <TableHead className="w-[20%]">Stock</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody showEmptyFallback={false}>
            {manyRows.map(row => (
                <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

const TableLongContentShowcase = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[20%]">Title</TableHead>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="w-[30%]">Notes</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody showEmptyFallback={false}>
            {longRows.map(row => (
                <TableRow key={row.title}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.notes}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

const fewRows = [
    {
        name: "Alice Johnson",
        role: "Engineer",
        email: "alice@example.com",
        status: "Active",
    },
    { name: "Bob Smith", role: "Designer", email: "bob@example.com", status: "Active" },
    {
        name: "Carol White",
        role: "Manager",
        email: "carol@example.com",
        status: "On Leave",
    },
    { name: "Dan Brown", role: "Analyst", email: "dan@example.com", status: "Active" },
]

const manyRows = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    product: `Product ${String.fromCodePoint(65 + (i % 26))}${i + 1}`,
    category: ["Electronics", "Books", "Clothing", "Food", "Tools"][i % 5] ?? "Other",
    price: `$${((i + 1) * 12.5).toFixed(2)}`,
    stock: (i + 1) * 5,
}))

const longRows = [
    {
        title: "Project Alpha Rewrite",
        description:
            "This is an extremely long description that should demonstrate how the table handles overflow content. It contains many details about the project scope, timeline, deliverables, stakeholder requirements, and technical specifications that make it stretch well beyond the column width.",
        notes: "High priority, needs review from architecture team before proceeding with implementation",
    },
    {
        title: "Database Migration",
        description:
            "Migrate all existing PostgreSQL databases from version 14 to version 18, including schema changes, index optimization, query plan analysis, performance benchmarking, rollback procedures, and comprehensive data integrity validation across all environments.",
        notes: "Scheduled for Q3, requires downtime window coordination with operations",
    },
    {
        title: "API Gateway Setup",
        description:
            "Configure and deploy a centralized API gateway with rate limiting, authentication, request transformation, response caching, circuit breaking, load balancing, SSL termination, and comprehensive monitoring with alerting for all downstream microservices.",
        notes: "Depends on infrastructure provisioning and security audit completion",
    },
]
