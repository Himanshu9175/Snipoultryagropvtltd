import { 
  FileText, 
  ShoppingCart, 
  BookOpen, 
  Receipt, 
  Package, 
  Plus,
  ClipboardList,
  Users
} from "lucide-react";

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  iconBgColor: string;
  iconColor: string;
  isPlaceholder?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "bill-entry",
    title: "Bill Entry",
    description: "Manage and create new bills",
    icon: FileText,
    path: "/bill-entry",
    iconBgColor: "bg-primary-50",
    iconColor: "text-primary",
  },
  {
    id: "material-purchase",
    title: "Material Purchase",
    description: "Track all material purchases",
    icon: ShoppingCart,
    path: "/material-purchase",
    iconBgColor: "bg-success-50",
    iconColor: "text-success-500",
  },
  {
    id: "ledger-book",
    title: "Ledger Book",
    description: "Financial records and entries",
    icon: BookOpen,
    path: "/ledger-book",
    iconBgColor: "bg-primary-50",
    iconColor: "text-primary",
  },
  {
    id: "bill-invoice",
    title: "Bill Invoice",
    description: "Generate and manage invoices",
    icon: Receipt,
    path: "/bill-invoice",
    iconBgColor: "bg-success-50",
    iconColor: "text-success-500",
  },
  {
    id: "lifting-book",
    title: "Lifting Book",
    description: "Track product movement",
    icon: Package,
    path: "/lifting-book",
    iconBgColor: "bg-primary-50",
    iconColor: "text-primary",
  },
  {
    id: "purchase-ledger",
    title: "Purchase Ledger",
    description: "Track feed purchase prices",
    icon: ClipboardList,
    path: "/purchase-ledger",
    iconBgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "customer-bill-ledger",
    title: "Customer Bill Ledger",
    description: "Bills for customer view",
    icon: Users,
    path: "/customer-bill-ledger",
    iconBgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "coming-soon-3",
    title: "Coming Soon",
    description: "Future feature",
    icon: Plus,
    path: "",
    iconBgColor: "bg-neutral-100",
    iconColor: "text-neutral-400",
    isPlaceholder: true,
  },
];
