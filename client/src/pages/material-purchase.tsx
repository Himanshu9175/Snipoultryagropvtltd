import { useState, useEffect } from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, ArrowLeft, Wheat, Pill, Egg, Calculator, Save, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/ui/bottom-nav";

const feedItems = ["Pre-PS", "Starter-SC(M)", "Starter-SC(P)", "Finisher-FP"];

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

export default function MaterialPurchase() {
  const [activeTab, setActiveTab] = useState("feed");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [freightCharges, setFreightCharges] = useState(0);
  const [notes, setNotes] = useState("");
  const [showStorageAlert, setShowStorageAlert] = useState(true);
  
  // Medicine purchase state
  const [medicineItems, setMedicineItems] = useState<{
    id: string;
    medicineName: string;
    quantity: number;
    rate: number;
    amount: number;
  }[]>([]);
  
  // Chick purchase state
  const [chickItems, setChickItems] = useState<{
    id: string;
    chickName: string;
    quantity: number;
    rate: number;
    amount: number;
  }[]>([]);
  
  // Add an empty item to start with
  useEffect(() => {
    if (items.length === 0) {
      addNewItem();
    }
  }, [items]);
  
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Calculate rate based on MRP and discount
  const calculateRate = (mrp: number, discountPercentage: number) => {
    const discountAmount = (mrp * discountPercentage) / 100;
    return mrp - discountAmount;
  };
  
  // Calculate amount based on quantity and rate
  const calculateAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };
  
  // Calculate cost per kg with freight charges
  const calculateCostPerKg = (rate: number, freightPerBag: number) => {
    // Assuming 50kg per bag
    const totalRatePerBag = rate + freightPerBag;
    return totalRatePerBag / 50;
  };
  
  // Update an item in the items array
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate rate if MRP or discount changes
        if (field === 'mrp' || field === 'discountPercentage') {
          updatedItem.rate = calculateRate(updatedItem.mrp, updatedItem.discountPercentage);
        }
        
        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate' || field === 'mrp' || field === 'discountPercentage') {
          updatedItem.amount = calculateAmount(updatedItem.quantity, updatedItem.rate);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  // Add a new item to the invoice
  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: generateId(),
      item: feedItems[0],
      mrp: 0,
      discountPercentage: 0,
      rate: 0,
      quantity: 0,
      amount: 0,
      costPerKg: 0
    };
    setItems([...items, newItem]);
  };
  
  // Remove an item from the invoice
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  // Calculate the grand total of all items
  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };
  
  // Calculate freight charges per bag
  const calculateFreightPerBag = () => {
    const totalBags = items.reduce((total, item) => total + item.quantity, 0);
    return totalBags > 0 ? freightCharges / totalBags : 0;
  };
  
  // Medicine Functions
  const addMedicineItem = () => {
    const newItem = {
      id: generateId(),
      medicineName: "",
      quantity: 0,
      rate: 0,
      amount: 0
    };
    setMedicineItems([...medicineItems, newItem]);
  };

  const updateMedicineItem = (id: string, field: string, value: any) => {
    setMedicineItems(medicineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeMedicineItem = (id: string) => {
    if (medicineItems.length > 1) {
      setMedicineItems(medicineItems.filter(item => item.id !== id));
    }
  };

  const calculateMedicineGrandTotal = () => {
    return medicineItems.reduce((total, item) => total + item.amount, 0);
  };

  // Chick Functions
  const addChickItem = () => {
    const newItem = {
      id: generateId(),
      chickName: "",
      quantity: 0,
      rate: 0,
      amount: 0
    };
    setChickItems([...chickItems, newItem]);
  };

  const updateChickItem = (id: string, field: string, value: any) => {
    setChickItems(chickItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeChickItem = (id: string) => {
    if (chickItems.length > 1) {
      setChickItems(chickItems.filter(item => item.id !== id));
    }
  };

  const calculateChickGrandTotal = () => {
    return chickItems.reduce((total, item) => total + item.amount, 0);
  };

  // Initialize medicine and chick items with one empty item when needed
  useEffect(() => {
    if (medicineItems.length === 0 && activeTab === "medicine") {
      addMedicineItem();
    }
  }, [medicineItems, activeTab]);

  useEffect(() => {
    if (chickItems.length === 0 && activeTab === "chicks") {
      addChickItem();
    }
  }, [chickItems, activeTab]);

  // Save invoice data to local storage
  const saveInvoice = () => {
    try {
      let invoiceData: any = {
        invoiceNo,
        invoiceDate,
        partyName,
        notes,
        timestamp: Date.now()
      };
      
      let storageKey = 'feedPurchaseInvoices';
      
      if (activeTab === "feed") {
        invoiceData = {
          ...invoiceData,
          items: items.map(item => ({
            ...item,
            costPerKg: calculateCostPerKg(item.rate, calculateFreightPerBag())
          })),
          freightCharges,
          grandTotal: calculateGrandTotal(),
          type: 'feed'
        };
        storageKey = 'feedPurchaseInvoices';
      } else if (activeTab === "medicine") {
        invoiceData = {
          ...invoiceData,
          items: medicineItems,
          grandTotal: calculateMedicineGrandTotal(),
          type: 'medicine'
        };
        storageKey = 'medicinePurchaseInvoices';
      } else if (activeTab === "chicks") {
        invoiceData = {
          ...invoiceData,
          items: chickItems,
          grandTotal: calculateChickGrandTotal(),
          type: 'chick'
        };
        storageKey = 'chickPurchaseInvoices';
      }
      
      // Get existing invoices or initialize empty array
      const existingInvoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new invoice
      existingInvoices.push(invoiceData);
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
      
      // Clear form
      setInvoiceNo("");
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setPartyName("");
      
      if (activeTab === "feed") {
        setItems([]);
        setFreightCharges(0);
      } else if (activeTab === "medicine") {
        setMedicineItems([]);
      } else if (activeTab === "chicks") {
        setChickItems([]);
      }
      
      setNotes("");
      
      alert("Invoice saved successfully!");
    } catch (error) {
      alert("Failed to save invoice. Please check browser storage permissions.");
      console.error("Error saving invoice:", error);
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
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-success-50 text-success-500">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Material Purchase</h1>
              <p className="text-neutral-600">Track and manage all purchases</p>
            </div>
          </div>
        </div>
        
        {showStorageAlert && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Storage Permission Required</h3>
              <p className="text-sm text-amber-700 mt-1">This application needs permission to store data on your device. Your data will be saved locally and won't be uploaded to any server.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100"
                onClick={() => setShowStorageAlert(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-card p-6">
          <Tabs defaultValue="feed" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="feed" className="flex items-center">
                <Wheat className="mr-2 h-4 w-4" />
                Feed Purchase
              </TabsTrigger>
              <TabsTrigger value="medicine" className="flex items-center">
                <Pill className="mr-2 h-4 w-4" />
                Medicine Purchase
              </TabsTrigger>
              <TabsTrigger value="chicks" className="flex items-center">
                <Egg className="mr-2 h-4 w-4" />
                Chicks Purchase
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="invoiceNo">Invoice No</Label>
                  <Input 
                    id="invoiceNo" 
                    value={invoiceNo} 
                    onChange={(e) => setInvoiceNo(e.target.value)} 
                    placeholder="Enter invoice number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoiceDate">Date</Label>
                  <Input 
                    id="invoiceDate" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partyName">Party Name</Label>
                  <Input 
                    id="partyName" 
                    value={partyName} 
                    onChange={(e) => setPartyName(e.target.value)} 
                    placeholder="Enter supplier/party name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="freightCharges">Freight Charges (₹)</Label>
                  <Input 
                    id="freightCharges" 
                    type="number" 
                    value={freightCharges.toString()} 
                    onChange={(e) => setFreightCharges(Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Invoice Items</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addNewItem}
                    className="flex items-center"
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="border border-neutral-200 rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity (Bags)</TableHead>
                        <TableHead>MRP (₹)</TableHead>
                        <TableHead>Discount %</TableHead>
                        <TableHead>Rate (₹)</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select 
                              value={item.item}
                              onValueChange={(value) => updateItem(item.id, 'item', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {feedItems.map((feedItem) => (
                                  <SelectItem key={feedItem} value={feedItem}>{feedItem}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.quantity === 0 ? "" : item.quantity.toString()} 
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.mrp === 0 ? "" : item.mrp.toString()} 
                              step="0.01"
                              onChange={(e) => updateItem(item.id, 'mrp', Number(e.target.value))}
                              placeholder="0.00"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.discountPercentage === 0 ? "" : item.discountPercentage.toString()} 
                              onChange={(e) => updateItem(item.id, 'discountPercentage', Number(e.target.value))}
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.rate.toFixed(2)} 
                              readOnly
                              className="w-24 bg-neutral-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.amount.toFixed(2)} 
                              readOnly
                              className="w-28 bg-neutral-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.id)}
                              disabled={items.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Add notes for this invoice"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-end mt-6">
                <div className="bg-neutral-50 p-4 rounded-lg w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Grand Total:</span>
                    <span className="font-bold">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    <div className="flex justify-between">
                      <span>Invoice Amount:</span>
                      <span>₹{calculateGrandTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freight Charges:</span>
                      <span>₹{freightCharges.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-dashed border-neutral-300 my-1 pt-1 flex justify-between font-medium">
                      <span>Total with Freight:</span>
                      <span>₹{(calculateGrandTotal() + freightCharges).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={saveInvoice} 
                  className="mt-4 flex items-center"
                  disabled={items.length === 0 || !invoiceNo || !partyName || items.some(item => item.quantity === 0)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Invoice
                </Button>
              </div>
              
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <Calculator className="mr-2 h-5 w-5 text-neutral-500" />
                  Cost Calculation Summary
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Per Bag Cost (with Freight)</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Base Rate</TableHead>
                            <TableHead>With Freight</TableHead>
                            <TableHead>Per KG</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => {
                            const freightPerBag = calculateFreightPerBag();
                            const rateWithFreight = item.rate + freightPerBag;
                            const costPerKg = rateWithFreight / 50;
                            
                            return (
                              <TableRow key={`summary-${item.id}`}>
                                <TableCell>{item.item}</TableCell>
                                <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                                <TableCell>₹{rateWithFreight.toFixed(2)}</TableCell>
                                <TableCell>₹{costPerKg.toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <p className="text-xs text-neutral-500 mt-3">
                        Note: Freight charges (₹{freightCharges}) distributed across {items.reduce((total, item) => total + item.quantity, 0)} bags = ₹{calculateFreightPerBag().toFixed(2)} per bag
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Invoice Notes</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Freight charges are not included in the invoice amount but are factored into the cost calculation.</li>
                        <li>• Each bag is assumed to be 50kg for per KG calculation.</li>
                        <li>• The per KG cost includes proportionally distributed freight charges.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="medicine" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="medicineInvoiceNo">Invoice No</Label>
                  <Input 
                    id="medicineInvoiceNo" 
                    value={invoiceNo} 
                    onChange={(e) => setInvoiceNo(e.target.value)} 
                    placeholder="Enter invoice number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="medicineInvoiceDate">Date</Label>
                  <Input 
                    id="medicineInvoiceDate" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="medicinePartyName">Party Name</Label>
                <Input 
                  id="medicinePartyName" 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)} 
                  placeholder="Enter supplier/party name"
                />
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Medicine Items</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addMedicineItem}
                    className="flex items-center"
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="border border-neutral-200 rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Medicine Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate (₹)</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex">
                              <Input 
                                value={item.medicineName} 
                                onChange={(e) => updateMedicineItem(item.id, 'medicineName', e.target.value)}
                                placeholder="Enter medicine name"
                                className="w-full"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="ml-1"
                                title="Use camera to scan medicine name"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.quantity === 0 ? "" : item.quantity.toString()} 
                              onChange={(e) => updateMedicineItem(item.id, 'quantity', Number(e.target.value))}
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.rate === 0 ? "" : item.rate.toString()} 
                              step="0.01"
                              onChange={(e) => updateMedicineItem(item.id, 'rate', Number(e.target.value))}
                              placeholder="0.00"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.amount.toFixed(2)} 
                              readOnly
                              className="w-28 bg-neutral-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeMedicineItem(item.id)}
                              disabled={medicineItems.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="medicineNotes">Notes</Label>
                  <Input 
                    id="medicineNotes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Add notes for this invoice"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-end mt-6">
                <div className="bg-neutral-50 p-4 rounded-lg w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Grand Total:</span>
                    <span className="font-bold">₹{calculateMedicineGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={saveInvoice}
                    className="flex items-center"
                    disabled={!invoiceNo || !invoiceDate || !partyName || medicineItems.length === 0 || medicineItems.some(item => !item.medicineName || item.quantity <= 0)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="chicks" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="chickInvoiceNo">Invoice No</Label>
                  <Input 
                    id="chickInvoiceNo" 
                    value={invoiceNo} 
                    onChange={(e) => setInvoiceNo(e.target.value)} 
                    placeholder="Enter invoice number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="chickInvoiceDate">Date</Label>
                  <Input 
                    id="chickInvoiceDate" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="chickPartyName">Party Name</Label>
                <Input 
                  id="chickPartyName" 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)} 
                  placeholder="Enter supplier/party name"
                />
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Chick Items</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addChickItem}
                    className="flex items-center"
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="border border-neutral-200 rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Chick Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate (₹)</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chickItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input 
                              value={item.chickName} 
                              onChange={(e) => updateChickItem(item.id, 'chickName', e.target.value)}
                              placeholder="Enter chick type/name"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.quantity === 0 ? "" : item.quantity.toString()} 
                              onChange={(e) => updateChickItem(item.id, 'quantity', Number(e.target.value))}
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.rate === 0 ? "" : item.rate.toString()} 
                              step="0.01"
                              onChange={(e) => updateChickItem(item.id, 'rate', Number(e.target.value))}
                              placeholder="0.00"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={item.amount.toFixed(2)} 
                              readOnly
                              className="w-28 bg-neutral-50"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeChickItem(item.id)}
                              disabled={chickItems.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="chickNotes">Notes</Label>
                  <Input 
                    id="chickNotes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Add notes for this invoice"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-end mt-6">
                <div className="bg-neutral-50 p-4 rounded-lg w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Grand Total:</span>
                    <span className="font-bold">₹{calculateChickGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={saveInvoice}
                    className="flex items-center"
                    disabled={!invoiceNo || !invoiceDate || !partyName || chickItems.length === 0 || chickItems.some(item => !item.chickName || item.quantity <= 0)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
