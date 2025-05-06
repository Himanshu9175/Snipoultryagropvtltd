import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, Filter, Search, AlertTriangle, Printer, FileDown, CreditCard, FileMinus, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PartyTransaction {
  id: string;
  billNo: string;
  date: string;
  type: 'feed' | 'medicine' | 'chick';
  items: any[];
  grandTotal: number;
  paymentType: 'cash' | 'credit';
  timestamp: number;
  notes?: string;
}

export function PartyTransactions() {
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [parties, setParties] = useState<{id: string, name: string}[]>([]);
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [transactionType, setTransactionType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: '', to: ''});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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

  // Load transactions for the selected party
  useEffect(() => {
    if (!selectedParty) return;
    
    try {
      // Collect all possible transactions from different storages
      const allTransactions: PartyTransaction[] = [];
      
      // Load feed bill invoices
      const feedBillsData = localStorage.getItem('feedBillInvoices');
      if (feedBillsData) {
        const feedBills = JSON.parse(feedBillsData);
        const partyFeedBills = feedBills.filter((bill: any) => bill.to === selectedParty);
        partyFeedBills.forEach((bill: any) => {
          allTransactions.push({
            id: bill.timestamp.toString(),
            billNo: bill.billNo,
            date: bill.billDate,
            type: 'feed',
            items: bill.items || [],
            grandTotal: bill.grandTotal,
            paymentType: bill.paymentType || 'credit',
            timestamp: bill.timestamp,
            notes: bill.notes
          });
        });
      }
      
      // Load medicine bill invoices
      const medicineBillsData = localStorage.getItem('medicineBillInvoices');
      if (medicineBillsData) {
        const medicineBills = JSON.parse(medicineBillsData);
        const partyMedicineBills = medicineBills.filter((bill: any) => bill.to === selectedParty);
        partyMedicineBills.forEach((bill: any) => {
          allTransactions.push({
            id: bill.timestamp.toString(),
            billNo: bill.billNo,
            date: bill.billDate,
            type: 'medicine',
            items: bill.items || [],
            grandTotal: bill.grandTotal,
            paymentType: bill.paymentType || 'credit',
            timestamp: bill.timestamp,
            notes: bill.notes
          });
        });
      }
      
      // Load chick bill invoices
      const chickBillsData = localStorage.getItem('chickBillInvoices');
      if (chickBillsData) {
        const chickBills = JSON.parse(chickBillsData);
        const partyChickBills = chickBills.filter((bill: any) => bill.to === selectedParty);
        partyChickBills.forEach((bill: any) => {
          allTransactions.push({
            id: bill.timestamp.toString(),
            billNo: bill.billNo,
            date: bill.billDate,
            type: 'chick',
            items: bill.items || [],
            grandTotal: bill.grandTotal,
            paymentType: bill.paymentType || 'credit',
            timestamp: bill.timestamp,
            notes: bill.notes
          });
        });
      }
      
      // Sort transactions by date (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);
      
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error Loading Transactions",
        description: "There was an error loading the transactions. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedParty, toast]);

  // Filter transactions based on type, date range, and search term
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (transactionType !== 'all' && transaction.type !== transactionType) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && new Date(transaction.date) < new Date(dateRange.from)) {
      return false;
    }
    if (dateRange.to && new Date(transaction.date) > new Date(dateRange.to)) {
      return false;
    }
    
    // Filter by search term (bill number, notes, or item names)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasMatchingBillNo = transaction.billNo.toLowerCase().includes(searchLower);
      const hasMatchingNotes = transaction.notes?.toLowerCase().includes(searchLower);
      const hasMatchingItems = transaction.items.some((item: any) => 
        item.item?.toLowerCase().includes(searchLower)
      );
      
      if (!hasMatchingBillNo && !hasMatchingNotes && !hasMatchingItems) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate totals
  const calculateTotals = () => {
    const result = {
      feed: 0,
      medicine: 0,
      chick: 0,
      total: 0
    };
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'feed') {
        result.feed += transaction.grandTotal;
      } else if (transaction.type === 'medicine') {
        result.medicine += transaction.grandTotal;
      } else if (transaction.type === 'chick') {
        result.chick += transaction.grandTotal;
      }
      result.total += transaction.grandTotal;
    });
    
    return result;
  };
  
  const totals = calculateTotals();

  // Print party statement
  const printStatement = () => {
    if (!selectedParty) {
      toast({
        title: "No Party Selected",
        description: "Please select a party to print a statement.",
        variant: "destructive"
      });
      return;
    }
    
    if (filteredTransactions.length === 0) {
      toast({
        title: "No Transactions",
        description: "There are no transactions to print for this party.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Failed",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive"
      });
      return;
    }
    
    // Create the print content
    const printContent = `
      <html>
        <head>
          <title>Party Statement - ${selectedParty}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            .date-range { text-align: center; margin-bottom: 20px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 30px; border-top: 2px solid #333; padding-top: 10px; }
            .total { font-weight: bold; }
            .feed { color: #1e88e5; }
            .medicine { color: #43a047; }
            .chick { color: #fb8c00; }
            .credit { color: #d81b60; }
            .cash { color: #0097a7; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Party Statement: ${selectedParty}</h1>
          <div class="date-range">
            ${dateRange.from || dateRange.to ? 
              `Period: ${dateRange.from || 'All'} to ${dateRange.to || 'Present'}` : 
              'All Transactions'}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th>Type</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.billNo}</td>
                  <td class="${t.type}">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                  <td>${t.items.map((item: any) => 
                    `${item.item} ${item.quantity ? `(${item.quantity})` : ''}`
                  ).join(', ')}</td>
                  <td class="${t.paymentType}">${t.paymentType.charAt(0).toUpperCase() + t.paymentType.slice(1)}</td>
                  <td>₹${t.grandTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <p>Feed Purchases: <span class="feed">₹${totals.feed.toFixed(2)}</span></p>
            <p>Medicine Purchases: <span class="medicine">₹${totals.medicine.toFixed(2)}</span></p>
            <p>Chick Purchases: <span class="chick">₹${totals.chick.toFixed(2)}</span></p>
            <p class="total">Total Purchases: ₹${totals.total.toFixed(2)}</p>
          </div>
          
          <button onclick="window.print();" style="padding: 10px; margin-top: 20px; cursor: pointer;">
            Print Statement
          </button>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give time for styles to load before printing
    setTimeout(() => {
      printWindow.focus();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Party Transactions</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Select Party</label>
          <Select value={selectedParty} onValueChange={setSelectedParty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a party" />
            </SelectTrigger>
            <SelectContent>
              {parties.map(party => (
                <SelectItem key={party.id} value={party.name}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Transaction Type</label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="chick">Chicks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">From Date</label>
            <Input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">To Date</label>
            <Input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            />
          </div>
        </div>
      </div>
      
      <div className="relative w-full max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
        <Input 
          className="pl-10" 
          placeholder="Search by bill number or items" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {selectedParty ? (
        <>
          {filteredTransactions.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{selectedParty}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-neutral-600">
                      {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </span>
                    {transactionType !== 'all' && (
                      <Badge variant="outline" className="bg-primary-50 text-primary border-primary-200">
                        {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button onClick={printStatement} className="text-primary w-full sm:w-auto">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Statement
                </Button>
              </div>
              
              {/* For larger screens */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6 hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-neutral-50">
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.billNo}</TableCell>
                        <TableCell>
                          {transaction.type === 'feed' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              Feed
                            </Badge>
                          )}
                          {transaction.type === 'medicine' && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Medicine
                            </Badge>
                          )}
                          {transaction.type === 'chick' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                              Chick
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <h4 className="font-medium mb-2">Bill Items</h4>
                              <div className="max-h-40 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {transaction.items.map((item: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell className="py-1">{item.item}</TableCell>
                                        <TableCell className="py-1">{item.quantity}</TableCell>
                                        <TableCell className="py-1 text-right">₹{item.sellingTotal.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          {transaction.paymentType === 'credit' ? (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                              Credit
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200">
                              Cash
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{transaction.grandTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* For mobile screens */}
              <div className="mb-6 md:hidden space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-neutral-200 rounded-md overflow-hidden">
                    <div className="bg-neutral-50 p-3 border-b border-neutral-200 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{transaction.billNo}</div>
                        <div className="text-xs text-neutral-500">{transaction.date}</div>
                      </div>
                      <div className="text-right font-semibold">₹{transaction.grandTotal.toFixed(2)}</div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-neutral-100">
                        <div className="text-sm text-neutral-600">Type</div>
                        <div>
                          {transaction.type === 'feed' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              Feed
                            </Badge>
                          )}
                          {transaction.type === 'medicine' && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Medicine
                            </Badge>
                          )}
                          {transaction.type === 'chick' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                              Chick
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-dashed border-neutral-100">
                        <div className="text-sm text-neutral-600">Payment</div>
                        <div>
                          {transaction.paymentType === 'credit' ? (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                              Credit
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200">
                              Cash
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-neutral-600">Items</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                              {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[calc(100vw-4rem)] max-w-sm">
                            <h4 className="font-medium mb-2">Bill Items</h4>
                            <div className="max-h-40 overflow-y-auto">
                              <div className="space-y-2">
                                {transaction.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between py-1 border-b border-neutral-100 last:border-0">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{item.item}</div>
                                      <div className="text-xs text-neutral-500">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="font-medium text-sm">₹{item.sellingTotal.toFixed(2)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 md:p-4">
                  <h4 className="text-blue-700 text-sm font-medium mb-1">Feed</h4>
                  <p className="text-blue-600 text-lg md:text-xl font-semibold">₹{totals.feed.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-md p-3 md:p-4">
                  <h4 className="text-green-700 text-sm font-medium mb-1">Medicine</h4>
                  <p className="text-green-600 text-lg md:text-xl font-semibold">₹{totals.medicine.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 md:p-4">
                  <h4 className="text-amber-700 text-sm font-medium mb-1">Chicks</h4>
                  <p className="text-amber-600 text-lg md:text-xl font-semibold">₹{totals.chick.toFixed(2)}</p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-violet-50 border border-violet-100 rounded-md p-3 md:p-4">
                  <h4 className="text-violet-700 text-sm font-medium mb-1">Total</h4>
                  <p className="text-violet-600 text-lg md:text-xl font-semibold">₹{totals.total.toFixed(2)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-neutral-600 mb-1">No Transactions Found</h3>
              <p className="text-neutral-500">There are no transactions matching your filters for {selectedParty}.</p>
              {(transactionType !== 'all' || dateRange.from || dateRange.to || searchTerm) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setTransactionType('all');
                    setDateRange({from: '', to: ''});
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="border border-dashed border-neutral-300 rounded-lg p-8 text-center">
          <FileMinus className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-neutral-600 mb-1">No Party Selected</h3>
          <p className="text-neutral-500">Please select a party to view their transaction history.</p>
        </div>
      )}
    </div>
  );
}
