import { useEffect, useState } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CreditCard, 
  Pill, 
  Baby, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  paymentType: 'cash' | 'credit';
}

export default function BillEntry() {
  const [activeTab, setActiveTab] = useState<'feed' | 'medicine' | 'chick'>('feed');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo] = useState('');
  const [parties, setParties] = useState<{id: string, name: string}[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'credit' | 'cash'>('credit');
  const [items, setItems] = useState<BillItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [itemOptions, setItemOptions] = useState<{
    feed?: {[key: string]: {rate: number, costPerKg: number, quantity: number}},
    medicine?: {[key: string]: {rate: number, costPerKg: number, quantity: number}},
    chick?: {[key: string]: {rate: number, costPerKg: number, quantity: number}}
  }>({});

  // Load parties from localStorage
  useEffect(() => {
    try {
      const savedParties = localStorage.getItem('parties');
      if (savedParties) {
        const parsedParties = JSON.parse(savedParties);
        setParties(parsedParties.map((party: any) => ({ id: party.id, name: party.name })));
      }
    } catch (error) {
      console.error("Error loading parties:", error);
    }
  }, []);

  // Load saved purchase data to get item rates and stock
  useEffect(() => {
    try {
      // Load feed purchase data to get rates and stock
      const feedPurchaseData = localStorage.getItem('feedPurchaseInvoices');
      if (feedPurchaseData) {
        const feedInvoices = JSON.parse(feedPurchaseData);
        // Process items and calculate average cost per kg
        const itemStock: {[key: string]: {totalQuantity: number, totalCost: number}} = {};
        
        feedInvoices.forEach((invoice: any) => {
          invoice.items.forEach((item: any) => {
            if (!itemStock[item.item]) {
              itemStock[item.item] = {
                totalQuantity: 0,
                totalCost: 0
              };
            }
            itemStock[item.item].totalQuantity += item.quantity;
            itemStock[item.item].totalCost += item.amount;
          });
        });
        
        // Calculate average cost per kg (assuming each bag is 50kg)
        const feedOptions: {[key: string]: {rate: number, costPerKg: number, quantity: number}} = {};
        Object.keys(itemStock).forEach(itemName => {
          const totalKg = itemStock[itemName].totalQuantity * 50; // 50kg per bag
          const costPerKg = totalKg > 0 ? itemStock[itemName].totalCost / totalKg : 0;
          feedOptions[itemName] = {
            rate: costPerKg, 
            costPerKg: costPerKg,
            quantity: itemStock[itemName].totalQuantity
          };
        });
        
        setItemOptions(prevOptions => ({
          ...prevOptions,
          feed: feedOptions
        }));
      }
      
      // Load medicine purchase data
      const medicinePurchaseData = localStorage.getItem('medicinePurchaseInvoices');
      if (medicinePurchaseData) {
        const medicineInvoices = JSON.parse(medicinePurchaseData);
        // Process items and calculate rates
        const medicineOptions: {[key: string]: {rate: number, costPerKg: number, quantity: number}} = {};
        
        medicineInvoices.forEach((invoice: any) => {
          invoice.items.forEach((item: any) => {
            if (!medicineOptions[item.item]) {
              medicineOptions[item.item] = {
                rate: item.rate,
                costPerKg: 0, // Not applicable for medicine
                quantity: 0
              };
            }
            medicineOptions[item.item].quantity += item.quantity;
          });
        });
        
        setItemOptions(prevOptions => ({
          ...prevOptions,
          medicine: medicineOptions
        }));
      }
      
      // Load chick purchase data
      const chickPurchaseData = localStorage.getItem('chickPurchaseInvoices');
      if (chickPurchaseData) {
        const chickInvoices = JSON.parse(chickPurchaseData);
        // Process items and calculate rates
        const chickOptions: {[key: string]: {rate: number, costPerKg: number, quantity: number}} = {};
        
        chickInvoices.forEach((invoice: any) => {
          invoice.items.forEach((item: any) => {
            if (!chickOptions[item.item]) {
              chickOptions[item.item] = {
                rate: item.rate,
                costPerKg: 0, // Not applicable for chicks
                quantity: 0
              };
            }
            chickOptions[item.item].quantity += item.quantity;
          });
        });
        
        setItemOptions(prevOptions => ({
          ...prevOptions,
          chick: chickOptions
        }));
      }
      
    } catch (error) {
      console.error("Error loading purchase data:", error);
    }
  }, []);

  // Add a new item to the bill
  const addItem = () => {
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      item: "",
      quantity: 1,
      weight: 50, // Default 50kg per bag
      buyingRate: 0,
      buyingTotal: 0,
      sellingRate: 0,
      sellingTotal: 0,
      pnl: 0,
      balanceBags: 0
    };
    setItems([...items, newItem]);
  };

  // Update an item in the bill
  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    
    // Update the specified field with proper type handling
    if (field === 'item') {
      item.item = value as string;
    } else if (field === 'quantity') {
      item.quantity = value as number;
    } else if (field === 'weight') {
      item.weight = value as number;
    } else if (field === 'buyingRate') {
      item.buyingRate = value as number;
    } else if (field === 'buyingTotal') {
      item.buyingTotal = value as number;
    } else if (field === 'sellingRate') {
      item.sellingRate = value as number;
    } else if (field === 'sellingTotal') {
      item.sellingTotal = value as number;
    } else if (field === 'pnl') {
      item.pnl = value as number;
    } else if (field === 'balanceBags') {
      item.balanceBags = value as number;
    }
    
    // Recalculate derived values based on active tab
    if (field === 'item') {
      if (activeTab === 'feed' && itemOptions.feed?.[value as string]) {
        item.buyingRate = itemOptions.feed[value as string].rate;
        item.balanceBags = itemOptions.feed[value as string].quantity - item.quantity;
      } else if (activeTab === 'medicine' && typeof value === 'string') {
        // For medicine, allow direct input of item name
        if (itemOptions.medicine?.[value]) {
          // If item exists in options, use its rate
          item.buyingRate = itemOptions.medicine[value].rate;
          item.balanceBags = itemOptions.medicine[value].quantity - item.quantity;
        }
        // If it doesn't exist, keep current buying rate
      } else if (activeTab === 'chick' && typeof value === 'string') {
        // For chicks, allow direct input of item name
        if (itemOptions.chick?.[value]) {
          // If item exists in options, use its rate
          item.buyingRate = itemOptions.chick[value].rate;
          item.balanceBags = itemOptions.chick[value].quantity - item.quantity;
        }
        // If it doesn't exist, keep current buying rate
      }
    }
    
    if (field === 'quantity' || field === 'buyingRate' || field === 'item') {
      if (activeTab === 'feed') {
        // Update weight (only for feed items)
        item.weight = item.quantity * 50; // 50kg per bag
      } else {
        // For medicine and chicks, weight is not applicable
        item.weight = 0;
      }
      
      if (activeTab === 'feed') {
        // Update buying total based on weight for feed
        item.buyingTotal = item.weight * item.buyingRate;
      } else {
        // For medicine and chicks, buying total is based on quantity
        item.buyingTotal = item.quantity * item.buyingRate;
      }
      
      // Update PnL
      item.pnl = item.sellingTotal - item.buyingTotal;
      
      // Update balance bags if item was selected
      if (item.item) {
        if (activeTab === 'feed' && itemOptions.feed?.[item.item]) {
          item.balanceBags = itemOptions.feed[item.item].quantity - item.quantity;
        } else if (activeTab === 'medicine' && itemOptions.medicine?.[item.item]) {
          item.balanceBags = itemOptions.medicine[item.item].quantity - item.quantity;
        } else if (activeTab === 'chick' && itemOptions.chick?.[item.item]) {
          item.balanceBags = itemOptions.chick[item.item].quantity - item.quantity;
        }
      }
    }
    
    if (field === 'sellingRate') {
      if (activeTab === 'feed') {
        // Update selling total based on weight for feed
        item.sellingTotal = item.weight * item.sellingRate;
      } else {
        // For medicine and chicks, selling total is based on quantity
        item.sellingTotal = item.quantity * item.sellingRate;
      }
      
      // Update PnL
      item.pnl = item.sellingTotal - item.buyingTotal;
    }
    
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  // Remove an item from the bill
  const removeItem = (index: number) => {
    setItemToDelete(index);
    setShowDeleteConfirm(true);
  };

  // Confirm item deletion
  const confirmDeleteItem = () => {
    if (itemToDelete !== null) {
      const updatedItems = items.filter((_, index) => index !== itemToDelete);
      setItems(updatedItems);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Calculate grand total
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.sellingTotal, 0);
  };

  // Save the bill
  const saveBill = () => {
    if (billNo.trim() === '') {
      toast({
        title: "Bill Number Required",
        description: "Please enter a valid bill number.",
        variant: "destructive"
      });
      return;
    }

    if (to.trim() === '') {
      toast({
        title: "Recipient Required",
        description: "Please specify who the bill is for.",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No Items Added",
        description: "Please add at least one item to the bill.",
        variant: "destructive"
      });
      return;
    }

    // Validate that all items have a name
    const invalidItems = items.some(item => item.item.trim() === '');
    if (invalidItems) {
      toast({
        title: "Invalid Items",
        description: "Please select a valid item for all entries.",
        variant: "destructive"
      });
      return;
    }

    const bill: Bill = {
      billNo,
      billDate,
      to,
      items,
      notes,
      grandTotal: calculateTotal(),
      timestamp: Date.now(),
      type: activeTab,
      paymentType: paymentType
    };

    try {
      // Get existing bills for Bill Invoice
      let billInvoiceKey = '';
      if (activeTab === 'feed') {
        billInvoiceKey = 'feedBillInvoices';
      } else if (activeTab === 'medicine') {
        billInvoiceKey = 'medicineBillInvoices';
      } else if (activeTab === 'chick') {
        billInvoiceKey = 'chickBillInvoices';
      }

      const existingBills = JSON.parse(localStorage.getItem(billInvoiceKey) || '[]');
      
      // Check for duplicate bill number
      const isDuplicate = existingBills.some((existingBill: Bill) => existingBill.billNo === billNo);
      if (isDuplicate) {
        toast({
          title: "Duplicate Bill Number",
          description: "A bill with this number already exists. Please use a different number.",
          variant: "destructive"
        });
        return;
      }
      
      // Add new bill to Bill Invoice
      const updatedBills = [...existingBills, bill];
      localStorage.setItem(billInvoiceKey, JSON.stringify(updatedBills));
      
      // Create simplified record for Customer Bill Ledger
      let customerBillLedgerKey = '';
      if (activeTab === 'feed') {
        customerBillLedgerKey = 'customerFeedBills';
      } else if (activeTab === 'medicine') {
        customerBillLedgerKey = 'customerMedicineBills';
      } else if (activeTab === 'chick') {
        customerBillLedgerKey = 'customerChickBills';
      }
      
      // Create a simplified bill for customer ledger
      const customerBill = {
        billNo,
        billDate,
        to,
        item: items.length > 0 ? items[0].item : '',
        weight: items.length > 0 ? items[0].weight : 0,
        quantity: items.length > 0 ? items[0].quantity : 0,
        category: activeTab,
        timestamp: Date.now()
      };
      
      // Get existing customer bills
      const existingCustomerBills = JSON.parse(localStorage.getItem(customerBillLedgerKey) || '[]');
      const updatedCustomerBills = [...existingCustomerBills, customerBill];
      localStorage.setItem(customerBillLedgerKey, JSON.stringify(updatedCustomerBills));
      
      toast({
        title: "Bill Saved Successfully",
        description: `Bill #${billNo} has been created and saved.`
      });
      
      // Clear form
      resetForm();
      
    } catch (error) {
      console.error("Error saving bill:", error);
      toast({
        title: "Error Saving Bill",
        description: "There was an error saving the bill. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Reset the form
  const resetForm = () => {
    setBillNo('');
    setBillDate(new Date().toISOString().split('T')[0]);
    setTo('');
    setNotes('');
    setItems([]);
  };

  // Clear recipient when payment type changes
  useEffect(() => {
    setTo('');
  }, [paymentType]);

  // Get available items based on the active tab
  const getAvailableItems = () => {
    if (activeTab === 'feed' && itemOptions.feed) {
      return Object.keys(itemOptions.feed).sort();
    } else if (activeTab === 'medicine' && itemOptions.medicine) {
      return Object.keys(itemOptions.medicine).sort();
    } else if (activeTab === 'chick' && itemOptions.chick) {
      return Object.keys(itemOptions.chick).sort();
    }
    return [];
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
              <h1 className="text-2xl font-bold text-neutral-800">Bill Entry</h1>
              <p className="text-neutral-600">Create and manage sales bills</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="billNo">Bill Number</Label>
                <Input 
                  id="billNo" 
                  placeholder="Enter bill number" 
                  value={billNo} 
                  onChange={(e) => setBillNo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billDate">Bill Date</Label>
                <Input 
                  id="billDate" 
                  type="date" 
                  value={billDate} 
                  onChange={(e) => setBillDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                {paymentType === 'credit' ? (
                  <select
                    id="to"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  >
                    <option value="">Select a party</option>
                    {parties.map(party => (
                      <option key={party.id} value={party.name}>{party.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input 
                    id="to" 
                    placeholder="Enter recipient" 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1"
                  />
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-6">
                  <h3 className="text-lg font-medium">Bill Items</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="paymentType" className="cursor-pointer">Payment Type:</Label>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <input 
                            type="radio" 
                            id="credit" 
                            name="paymentType" 
                            value="credit" 
                            checked={paymentType === 'credit'}
                            onChange={() => setPaymentType('credit')}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <Label htmlFor="credit" className="cursor-pointer text-sm">Credit</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input 
                            type="radio" 
                            id="cash" 
                            name="paymentType" 
                            value="cash" 
                            checked={paymentType === 'cash'}
                            onChange={() => setPaymentType('cash')}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <Label htmlFor="cash" className="cursor-pointer text-sm">Cash</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={addItem} 
                  type="button" 
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-neutral-300 rounded-md p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-500">No items added yet. Click "Add Item" to start creating your bill.</p>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        {activeTab === 'feed' && <TableHead>Weight (kg)</TableHead>}
                        <TableHead>Buying Rate {activeTab === 'feed' ? '(₹/kg)' : '(₹)'}</TableHead>
                        <TableHead>Buying Total (₹)</TableHead>
                        <TableHead>Selling Rate {activeTab === 'feed' ? '(₹/kg)' : '(₹)'}</TableHead>
                        <TableHead>Selling Total (₹)</TableHead>
                        <TableHead>P&L</TableHead>
                        <TableHead>Balance Bags</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {activeTab === 'feed' ? (
                              <Select 
                                value={item.item || undefined} 
                                onValueChange={(value) => updateItem(index, 'item', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableItems().map((itemName) => (
                                    <SelectItem key={itemName} value={itemName}>
                                      {itemName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type="text"
                                placeholder="Enter item name"
                                value={item.item}
                                onChange={(e) => updateItem(index, 'item', e.target.value)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="1"
                              value={item.quantity} 
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          {activeTab === 'feed' && (
                            <TableCell className="text-neutral-500">
                              {item.weight}
                            </TableCell>
                          )}
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              value={item.buyingRate} 
                              onChange={(e) => updateItem(index, 'buyingRate', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-neutral-500 font-medium">
                            ₹{item.buyingTotal.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              value={item.sellingRate} 
                              onChange={(e) => updateItem(index, 'sellingRate', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-neutral-500 font-medium">
                            ₹{item.sellingTotal.toFixed(2)}
                          </TableCell>
                          <TableCell className={`font-medium ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{item.pnl.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {item.balanceBags}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={activeTab === 'feed' ? 6 : 5} className="text-right font-medium">Total:</TableCell>
                        <TableCell className="font-medium">₹{calculateTotal().toFixed(2)}</TableCell>
                        <TableCell colSpan={3}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="mb-6">
              <Label htmlFor="notes">Notes</Label>
              <textarea 
                id="notes" 
                className="mt-1 w-full p-2 border border-neutral-200 rounded-md" 
                rows={3}
                placeholder="Add any additional notes or comments about this bill"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={resetForm}
                type="button"
              >
                Reset
              </Button>
              <Button 
                onClick={saveBill}
                type="button"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Save Bill
              </Button>
            </div>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from the bill? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteItem}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
