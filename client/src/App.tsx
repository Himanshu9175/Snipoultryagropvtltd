import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BillEntry from "@/pages/bill-entry";
import MaterialPurchase from "@/pages/material-purchase";
import LedgerBook from "@/pages/ledger-book";
import BillInvoice from "@/pages/bill-invoice";
import LiftingBook from "@/pages/lifting-book";
import PurchaseLedger from "@/pages/purchase-ledger";
import CustomerBillLedger from "@/pages/customer-bill-ledger";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bill-entry" component={BillEntry} />
      <Route path="/material-purchase" component={MaterialPurchase} />
      <Route path="/ledger-book" component={LedgerBook} />
      <Route path="/bill-invoice" component={BillInvoice} />
      <Route path="/lifting-book" component={LiftingBook} />
      <Route path="/purchase-ledger" component={PurchaseLedger} />
      <Route path="/customer-bill-ledger" component={CustomerBillLedger} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
