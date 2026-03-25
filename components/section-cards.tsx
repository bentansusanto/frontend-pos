"use client"

import {
  IconCurrencyDollar,
  IconReceipt,
  IconUsers,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface SectionCardsProps {
  totalSales: number;
  averageTransaction: number;
  totalCustomers: number;
  totalTransactions: number;
}

const cards = (props: SectionCardsProps) => [
  {
    label: "Total Sales",
    value: formatCurrency(props.totalSales),
    icon: IconCurrencyDollar,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-50/60 to-card dark:from-emerald-950/20",
    badge: "+12.5%",
  },
  {
    label: "Average Transaction",
    value: formatCurrency(props.averageTransaction),
    icon: IconReceipt,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-50/60 to-card dark:from-blue-950/20",
    badge: "+8.2%",
  },
  {
    label: "Total Customers",
    value: props.totalCustomers.toLocaleString(),
    icon: IconUsers,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    gradient: "from-violet-50/60 to-card dark:from-violet-950/20",
    badge: "+5.1%",
  },
  {
    label: "Total Transactions",
    value: props.totalTransactions.toLocaleString(),
    icon: IconShoppingCart,
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-50/60 to-card dark:from-orange-950/20",
    badge: "+3.7%",
  },
]

export function SectionCards(props: SectionCardsProps) {
  const items = cards(props)
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {items.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className={`@container/card bg-gradient-to-br ${card.gradient} border shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                <IconTrendingUp className="h-3 w-3" />
                {card.badge}
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight @[250px]/card:text-3xl">
                {card.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
