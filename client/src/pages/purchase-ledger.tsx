import React, { useState, useEffect } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, FileText, Search, ChevronDown, ChevronUp, 
  AlertTriangle, Edit, Trash2, Plus, FilePlus, CreditCard, Pill, 
  Baby, DollarSign, Calendar as CalendarIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface InvoiceItem {
  id: string;
  item: string;
  mrp: number;
  discountPercentage: number;
  rate: number;
  quantity: number;
  amount: number;
  costPerKg: number;
}

interface Invoice {
  invoiceNo: string;
  invoiceDate: string;
  partyName: string;
  items: InvoiceItem[];
  freightCharges: number;
  notes: string;
  grandTotal: number;
  timestamp: number;
  type?: 'feed' | 'medicine' | 'chick';
}

interface Payment {
  id: string;
  date: string;
  partyName: string;
  from: string;
  amount: number;
  note: string;
  timestamp: number;
  type: 'feed' | 'medicine' | 'chick';
}

export default function PurchaseLedger() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expandedInvoices, setExpandedInvoices] = useState<{[key: string]: boolean}>({});
  const [noDataFound, setNoDataFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "medicine" | "chick">("feed");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'invoice' | 'payment', id: string } | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [date, setDate] = useState<Date>();

  // Effect to load data on initial render and when active tab changes
  useEffect(() => {
    // Load invoices from all sources
    try {
      let allInvoices: Invoice[] = [];
      
      // Load feed invoices
      const feedInvoices = localStorage.getItem('feedPurchaseInvoices');
      if (feedInvoices) {
        const parsedInvoices = JSON.parse(feedInvoices) as Invoice[];
        allInvoices = [...allInvoices, ...parsedInvoices.map(invoice => ({
          ...invoice,
          type: invoice.type || 'feed'
        }))];
      }
      
      // Load medicine invoices
      const medicineInvoices = localStorage.getItem('medicinePurchaseInvoices');
      if (medicineInvoices) {
        const parsedInvoices = JSON.parse(medicineInvoices) as Invoice[];
        allInvoices = [...allInvoices, ...parsedInvoices.map(invoice => ({
          ...invoice,
          type: invoice.type || 'medicine'
        }))];
      }
      
      // Load chick invoices
      const chickInvoices = localStorage.getItem('chickPurchaseInvoices');
      if (chickInvoices) {
        const parsedInvoices = JSON.parse(chickInvoices) as Invoice[];
        allInvoices = [...allInvoices, ...parsedInvoices.map(invoice => ({
          ...invoice,
          type: invoice.type || 'chick'
        }))];
      }

      // Sort invoices by date (newest first)
      allInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
      
      // Filter invoices by active tab
      const filteredInvoices = allInvoices.filter(invoice => invoice.type === activeTab);
      setInvoices(filteredInvoices);
      setNoDataFound(filteredInvoices.length === 0);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setNoDataFound(true);
    }

    // Load payments from localStorage
    try {
      const storedPayments = localStorage.getItem('purchasePayments');
      if (storedPayments) {
        const parsedPayments = JSON.parse(storedPayments) as Payment[];
        // Filter payments by active tab
        const filteredPayments = parsedPayments.filter(payment => payment.type === activeTab);
        filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPayments(filteredPayments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
    }
  }, [activeTab]);

  const toggleInvoiceExpansion = (invoiceNo: string) => {
    setExpandedInvoices(prev => ({
      ...prev,
      [invoiceNo]: !prev[invoiceNo]
    }));
  };

  const calculateTotalQuantity = (items: InvoiceItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to add a new payment
  const addPayment = (payment: Omit<Payment, 'id' | 'timestamp'>) => {
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem('purchasePayments', JSON.stringify(updatedPayments));
    toast({
      title: 'Payment Added',
      description: `Payment of ₹${payment.amount.toFixed(2)} has been recorded.`
    });
    setShowPaymentDialog(false);
  };

  // Function to edit a payment
  const editPayment = (payment: Payment) => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id ? payment : p
    );
    
    setPayments(updatedPayments);
    localStorage.setItem('purchasePayments', JSON.stringify(updatedPayments));
    toast({
      title: 'Payment Updated',
      description: 'Payment details have been updated successfully.'
    });
    setShowPaymentDialog(false);
  };

  // Function to delete a payment
  const deletePayment = (paymentId: string) => {
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    setPayments(updatedPayments);
    localStorage.setItem('purchasePayments', JSON.stringify(updatedPayments));
    toast({
      title: 'Payment Deleted',
      description: 'Payment has been deleted successfully.'
    });
    setShowDeleteConfirm(false);
  };

  // Function to delete an invoice
  const deleteInvoice = (invoiceNo: string) => {
    // First find the invoice to determine its type
    const invoiceToDelete = invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (!invoiceToDelete) return;
    
    const updatedInvoices = invoices.filter(inv => inv.invoiceNo !== invoiceNo);
    setInvoices(updatedInvoices);
    
    // Determine which storage key to use based on the invoice type
    let storageKey = 'feedPurchaseInvoices';
    if (invoiceToDelete.type === 'medicine') {
      storageKey = 'medicinePurchaseInvoices';
    } else if (invoiceToDelete.type === 'chick') {
      storageKey = 'chickPurchaseInvoices';
    }
    
    // Get the current invoices of this type from localStorage
    const currentStoredInvoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedStoredInvoices = currentStoredInvoices.filter(
      (inv: Invoice) => inv.invoiceNo !== invoiceNo
    );
    
    // Save the updated list back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedStoredInvoices));
    
    toast({
      title: 'Invoice Deleted',
      description: 'Invoice has been deleted successfully.'
    });
    setShowDeleteConfirm(false);
  };
  
  // Filter invoices by active tab (feed, medicine, chick)
  const filteredInvoices = invoices.filter(invoice => invoice.type === activeTab);
  
  // Filter payments by active tab
  const filteredPayments = payments.filter(payment => payment.type === activeTab);
  
  // Calculate financial summary for the current tab
  const calculateSummary = () => {
    // Calculate total purchased amount from invoices
    const totalPurchased = filteredInvoices.reduce((total, invoice) => total + invoice.grandTotal, 0);
    
    // Calculate total paid amount from payments
    const totalPaid = filteredPayments.reduce((total, payment) => total + payment.amount, 0);
    
    // Calculate balance (purchased - paid)
    const balance = totalPurchased - totalPaid;
    
    return {
      totalPurchased,
      totalPaid,
      balance
    };
  };
  
  // Get financial summary for the current tab
  const summary = calculateSummary();

  // Confirm deletion handler
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'invoice') {
        deleteInvoice(itemToDelete.id);
      } else {
        deletePayment(itemToDelete.id);
      }
    }
  };

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
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-50 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Purchase Ledger</h1>
              <p className="text-neutral-600">View and analyze all purchase invoices</p>
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
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Purchase Ledger: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <div className="space-x-2">
                <Button size="sm" onClick={() => {
                  setCurrentPayment({
                    id: '',
                    date: new Date().toISOString().split('T')[0],
                    partyName: '',
                    from: '',
                    amount: 0,
                    note: '',
                    timestamp: 0,
                    type: activeTab
                  });
                  setShowPaymentDialog(true);
                }}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/material-purchase">
                    <Plus className="mr-2 h-4 w-4" />
                    New Purchase
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Financial Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-neutral-100">
              <h4 className="text-sm font-medium text-neutral-600 mb-3">Financial Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Total Purchased</div>
                  <div className="text-2xl font-bold text-primary mt-1">₹{summary.totalPurchased.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Total Paid</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">₹{summary.totalPaid.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="text-sm text-neutral-500">Balance Due</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">₹{summary.balance.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="invoices">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoices">
                {filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                    <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                    <p className="text-center max-w-md">
                      There are no {activeTab} purchase invoices stored on this device. Add invoices through the Material Purchase page.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/material-purchase">Go to Material Purchase</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Party Name</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <React.Fragment key={invoice.invoiceNo}>
                            <TableRow>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => toggleInvoiceExpansion(invoice.invoiceNo)}
                                >
                                  {expandedInvoices[invoice.invoiceNo] ? 
                                    <ChevronUp className="h-4 w-4" /> : 
                                    <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                              <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                              <TableCell>{invoice.partyName}</TableCell>
                              <TableCell>{invoice.items.length} items ({calculateTotalQuantity(invoice.items)} bags)</TableCell>
                              <TableCell>₹{invoice.grandTotal.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setItemToDelete({ type: 'invoice', id: invoice.invoiceNo });
                                      setShowDeleteConfirm(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedInvoices[invoice.invoiceNo] && (
                              <TableRow className="bg-neutral-50">
                                <TableCell colSpan={7} className="p-4">
                                  <h4 className="font-medium mb-2">Invoice Items</h4>
                                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Item</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>MRP</TableHead>
                                          <TableHead>Discount</TableHead>
                                          <TableHead>Rate</TableHead>
                                          <TableHead>Amount</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {invoice.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.item}</TableCell>
                                            <TableCell>{item.quantity} bags</TableCell>
                                            <TableCell>₹{item.mrp.toFixed(2)}</TableCell>
                                            <TableCell>{item.discountPercentage}%</TableCell>
                                            <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                                            <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-right font-medium">Invoice Total:</TableCell>
                                          <TableCell>₹{invoice.grandTotal.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-right text-neutral-500">Freight Charges:</TableCell>
                                          <TableCell className="text-neutral-500">₹{invoice.freightCharges.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-right text-xs text-neutral-500">(Not included in invoice total)</TableCell>
                                          <TableCell></TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                  {invoice.notes && (
                                    <div className="mt-3">
                                      <h4 className="font-medium">Notes:</h4>
                                      <p className="text-sm text-neutral-600">{invoice.notes}</p>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="payments">
                {filteredPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                    <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Payments Found</h3>
                    <p className="text-center max-w-md">
                      There are no {activeTab} payments recorded yet.
                    </p>
                    <Button className="mt-4" onClick={() => {
                      setCurrentPayment({
                        id: '',
                        date: new Date().toISOString().split('T')[0],
                        partyName: '',
                        from: '',
                        amount: 0,
                        note: '',
                        timestamp: 0,
                        type: activeTab
                      });
                      setShowPaymentDialog(true);
                    }}>
                      Add Payment
                    </Button>
                  </div>
                ) : (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Party Name</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.date)}</TableCell>
                            <TableCell>{payment.partyName}</TableCell>
                            <TableCell>{payment.from}</TableCell>
                            <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{payment.note || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setCurrentPayment(payment);
                                    setShowPaymentDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setItemToDelete({ type: 'payment', id: payment.id });
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <TabsContent value="feed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-medium mb-4">Latest Feed Prices (Per KG)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feed Type</TableHead>
                          <TableHead>Price per KG</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // Get the latest price for each feed type
                          const feedTypes = ['Pre-PS', 'Starter-SC(M)', 'Starter-SC(P)', 'Finisher-FP'];
                          const latestPrices: {[key: string]: {price: number, date: string}} = {};
                          
                          // Find the latest invoice for each feed type
                          invoices.filter(inv => inv.type === 'feed').forEach(invoice => {
                            invoice.items.forEach(item => {
                              // Calculate cost per kg (including freight)
                              const totalBags = calculateTotalQuantity(invoice.items);
                              const freightPerBag = totalBags > 0 ? invoice.freightCharges / totalBags : 0;
                              const costPerKg = (item.rate + freightPerBag) / 50;
                              
                              if (!latestPrices[item.item] || new Date(invoice.invoiceDate) > new Date(latestPrices[item.item].date)) {
                                latestPrices[item.item] = {
                                  price: costPerKg,
                                  date: invoice.invoiceDate
                                };
                              }
                            });
                          });
                          
                          return feedTypes.map(feedType => (
                            <TableRow key={feedType}>
                              <TableCell>{feedType}</TableCell>
                              <TableCell>
                                {latestPrices[feedType] ? 
                                  `₹${latestPrices[feedType].price.toFixed(2)}` : 
                                  'No data'}
                              </TableCell>
                              <TableCell>
                                {latestPrices[feedType] ? 
                                  formatDate(latestPrices[feedType].date) : 
                                  '-'}
                              </TableCell>
                            </TableRow>
                          ));
                        })()} 
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-medium mb-4">Summary (Last 30 Days)</h3>
                    <div className="space-y-4">
                      {(() => {
                        // Calculate total purchases in the last 30 days
                        const today = new Date();
                        const thirtyDaysAgo = new Date(today);
                        thirtyDaysAgo.setDate(today.getDate() - 30);
                        
                        // Filter invoices from the last 30 days
                        const recentInvoices = invoices.filter(invoice => 
                          invoice.type === activeTab && new Date(invoice.invoiceDate) >= thirtyDaysAgo
                        );
                        
                        // Calculate totals
                        const totalAmount = recentInvoices.reduce((total, invoice) => 
                          total + invoice.grandTotal, 0
                        );
                        
                        const totalBags = recentInvoices.reduce((total, invoice) => 
                          total + calculateTotalQuantity(invoice.items), 0
                        );
                        
                        const totalFreight = recentInvoices.reduce((total, invoice) => 
                          total + invoice.freightCharges, 0
                        );
                        
                        // Calculate total payments
                        const recentPayments = payments.filter(payment => 
                          payment.type === activeTab && new Date(payment.date) >= thirtyDaysAgo
                        );
                        
                        const totalPayments = recentPayments.reduce((total, payment) => 
                          total + payment.amount, 0
                        );
                        
                        return (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                              <span className="text-neutral-600">Total Invoices</span>
                              <span className="font-medium">{recentInvoices.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                              <span className="text-neutral-600">Total Bags</span>
                              <span className="font-medium">{totalBags}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                              <span className="text-neutral-600">Purchases</span>
                              <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                              <span className="text-neutral-600">Freight</span>
                              <span className="font-medium">₹{totalFreight.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                              <span className="text-neutral-600">Payments Made</span>
                              <span className="font-medium">₹{totalPayments.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-neutral-600 font-semibold">Balance Due</span>
                              <span className="font-bold">₹{(totalAmount - totalPayments).toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentPayment?.id ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
            <DialogDescription>
              {currentPayment?.id ? 'Update the payment details below.' : 'Enter the payment details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : currentPayment?.date ? format(new Date(currentPayment.date), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date || (currentPayment?.date ? new Date(currentPayment.date) : undefined)}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partyName" className="text-right">
                Party Name
              </Label>
              <Input
                id="partyName"
                defaultValue={currentPayment?.partyName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">
                From
              </Label>
              <Input
                id="from"
                defaultValue={currentPayment?.from || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                defaultValue={currentPayment?.amount || 0}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Textarea
                id="note"
                defaultValue={currentPayment?.note || ''}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => {
              const formData = {
                id: currentPayment?.id || '',
                date: date ? date.toISOString().split('T')[0] : currentPayment?.date || new Date().toISOString().split('T')[0],
                partyName: (document.getElementById('partyName') as HTMLInputElement).value,
                from: (document.getElementById('from') as HTMLInputElement).value,
                amount: parseFloat((document.getElementById('amount') as HTMLInputElement).value),
                note: (document.getElementById('note') as HTMLTextAreaElement).value,
                timestamp: currentPayment?.timestamp || 0,
                type: activeTab
              };
              
              if (currentPayment?.id) {
                editPayment(formData as Payment);
              } else {
                addPayment(formData);
              }
            }}>
              {currentPayment?.id ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
      <BottomNav />
    </div>
  );
}