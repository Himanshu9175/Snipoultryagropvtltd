import React, { useEffect, useState } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  ArrowLeft, 
  Printer, 
  Download, 
  Send, 
  CreditCard,
  Pill,
  Baby,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { BillInvoicePrint } from "@/components/bill-invoice-print";
import { Link } from "wouter";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface BillItem {
  id: string;
  item: string;
  quantity: number;
  weight: number;
  buyingRate: number;
  buyingTotal: number;
  sellingRate: number;
  sellingTotal: number;
  pnl: number;
  balanceBags: number;
}

interface Bill {
  billNo: string;
  billDate: string;
  to: string;
  items: BillItem[];
  notes: string;
  grandTotal: number;
  timestamp: number;
  type: 'feed' | 'medicine' | 'chick';
}

export default function BillInvoice() {
  const [activeTab, setActiveTab] = useState<'feed' | 'medicine' | 'chick'>('feed');
  const [bills, setBills] = useState<Bill[]>([]);
  const [expandedBills, setExpandedBills] = useState<{[key: string]: boolean}>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [noDataFound, setNoDataFound] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Load bills when active tab changes
  useEffect(() => {
    loadBills();
  }, [activeTab]);

  // Load bills from localStorage
  const loadBills = () => {
    try {
      let storageKey = '';
      if (activeTab === 'feed') {
        storageKey = 'feedBillInvoices';
      } else if (activeTab === 'medicine') {
        storageKey = 'medicineBillInvoices';
      } else if (activeTab === 'chick') {
        storageKey = 'chickBillInvoices';
      }

      const storedBills = localStorage.getItem(storageKey);
      if (storedBills) {
        const parsedBills = JSON.parse(storedBills) as Bill[];
        // Sort bills by date (newest first)
        parsedBills.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
        setBills(parsedBills);
        setNoDataFound(parsedBills.length === 0);
      } else {
        setBills([]);
        setNoDataFound(true);
      }
    } catch (error) {
      console.error("Error loading bills:", error);
      setNoDataFound(true);
    }
  };

  // Toggle bill expansion
  const toggleBillExpansion = (billNo: string) => {
    setExpandedBills(prev => ({
      ...prev,
      [billNo]: !prev[billNo]
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Delete a bill
  const deleteBill = (billNo: string) => {
    setBillToDelete(billNo);
    setShowDeleteConfirm(true);
  };

  // Confirm bill deletion
  const confirmDeleteBill = () => {
    if (billToDelete) {
      try {
        let storageKey = '';
        if (activeTab === 'feed') {
          storageKey = 'feedBillInvoices';
        } else if (activeTab === 'medicine') {
          storageKey = 'medicineBillInvoices';
        } else if (activeTab === 'chick') {
          storageKey = 'chickBillInvoices';
        }

        const updatedBills = bills.filter(bill => bill.billNo !== billToDelete);
        localStorage.setItem(storageKey, JSON.stringify(updatedBills));
        setBills(updatedBills);
        setNoDataFound(updatedBills.length === 0);
        setShowDeleteConfirm(false);
        setBillToDelete(null);
        
        toast({
          title: "Bill Deleted",
          description: "The bill has been successfully deleted."
        });
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast({
          title: "Error Deleting Bill",
          description: "There was an error deleting the bill. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Calculate financial summary
  const calculateSummary = () => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalProfit = bills.reduce((sum, bill) => {
      const billProfit = bill.items.reduce((itemSum, item) => itemSum + item.pnl, 0);
      return sum + billProfit;
    }, 0);

    return {
      totalBills,
      totalAmount,
      totalProfit
    };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 pb-16 md:pb-0">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-success-50 text-success-500">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Bill Invoice</h1>
              <p className="text-neutral-600">Manage and view all sales invoices</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <Tabs defaultValue="feed" onValueChange={(value) => setActiveTab(value as "feed" | "medicine" | "chick")}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="feed" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="medicine" className="flex items-center">
                <Pill className="mr-2 h-4 w-4" />
                Medicine
              </TabsTrigger>
              <TabsTrigger value="chick" className="flex items-center">
                <Baby className="mr-2 h-4 w-4" />
                Chicks
              </TabsTrigger>
            </TabsList>

            {/* Financial Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-600 mb-3">Financial Summary - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Total Bills</div>
                  <div className="text-2xl font-bold text-primary mt-1">{summary.totalBills}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Total Amount</div>
                  <div className="text-2xl font-bold text-success-600 mt-1">₹{summary.totalAmount.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Total Profit</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">₹{summary.totalProfit.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Bills</h3>
              <Button size="sm" asChild>
                <Link href="/bill-entry">
                  Create New Bill
                </Link>
              </Button>
            </div>

            {noDataFound ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Bills Found</h3>
                <p className="text-center max-w-md">
                  There are no {activeTab} bills stored on this device. Create bills through the Bill Entry page.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/bill-entry">Go to Bill Entry</Link>
                </Button>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => [
                      <TableRow key={`row-${bill.billNo}`}>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => toggleBillExpansion(bill.billNo)}
                          >
                            {expandedBills[bill.billNo] ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{bill.billNo}</TableCell>
                        <TableCell>{formatDate(bill.billDate)}</TableCell>
                        <TableCell>{bill.to}</TableCell>
                        <TableCell>{bill.items.length} items</TableCell>
                        <TableCell>₹{bill.grandTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/bill-entry?edit=${bill.billNo}&type=${bill.type}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteBill(bill.billNo)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowPrintModal(true);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>,
                      
                      expandedBills[bill.billNo] && (
                        <TableRow key={`details-${bill.billNo}`} className="bg-neutral-50">
                          <TableCell colSpan={7} className="p-4">
                            <h4 className="font-medium mb-2">Bill Items</h4>
                            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Weight (kg)</TableHead>
                                    <TableHead>Buying Rate (₹/kg)</TableHead>
                                    <TableHead>Buying Total (₹)</TableHead>
                                    <TableHead>Selling Rate (₹/kg)</TableHead>
                                    <TableHead>Selling Total (₹)</TableHead>
                                    <TableHead>P&L</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {bill.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.item}</TableCell>
                                      <TableCell>{item.quantity} bags</TableCell>
                                      <TableCell>{item.weight} kg</TableCell>
                                      <TableCell>₹{item.buyingRate.toFixed(2)}</TableCell>
                                      <TableCell>₹{item.buyingTotal.toFixed(2)}</TableCell>
                                      <TableCell>₹{item.sellingRate.toFixed(2)}</TableCell>
                                      <TableCell>₹{item.sellingTotal.toFixed(2)}</TableCell>
                                      <TableCell className={`font-medium ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{item.pnl.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-right font-medium">Grand Total:</TableCell>
                                    <TableCell className="font-medium">₹{bill.grandTotal.toFixed(2)}</TableCell>
                                    <TableCell className="font-medium">₹{bill.items.reduce((sum, item) => sum + item.pnl, 0).toFixed(2)}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                            {bill.notes && (
                              <div className="mt-3">
                                <h4 className="font-medium">Notes:</h4>
                                <p className="text-sm text-neutral-600">{bill.notes}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowPrintModal(true);
                                }}
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ]).flat().filter(Boolean)}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* Bill Invoice Print Modal */}
      {showPrintModal && selectedBill && (
        <BillInvoicePrint 
          bill={selectedBill} 
          onClose={() => setShowPrintModal(false)} 
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteBill}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
