import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  CreditCard,
  Pill,
  Baby,
  Printer,
} from 'lucide-react';
import { CustomerBillPrint } from "@/components/customer-bill-print";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { BottomNav } from '@/components/ui/bottom-nav';

// Define a simplified bill structure for the customer ledger
interface CustomerBill {
  billNo: string;
  billDate: string;
  to: string;
  item: string;
  weight: number;
  category: 'feed' | 'medicine' | 'chick';
  timestamp: number;
}

export default function CustomerBillLedger() {
  const [activeTab, setActiveTab] = useState<'feed' | 'medicine' | 'chick'>('feed');
  const [bills, setBills] = useState<CustomerBill[]>([]);
  const [expandedBills, setExpandedBills] = useState<{[key: string]: boolean}>({});
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<CustomerBill | null>(null);
  const { toast } = useToast();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Load bills from localStorage on component mount
  useEffect(() => {
    loadBills();
  }, [activeTab]);

  // Load bills for the active tab
  const loadBills = () => {
    try {
      let storageKey = '';
      if (activeTab === 'feed') {
        storageKey = 'customerFeedBills';
      } else if (activeTab === 'medicine') {
        storageKey = 'customerMedicineBills';
      } else if (activeTab === 'chick') {
        storageKey = 'customerChickBills';
      }

      const savedBills = localStorage.getItem(storageKey);
      if (savedBills) {
        const parsedBills = JSON.parse(savedBills);
        setBills(parsedBills);
      } else {
        setBills([]);
      }
    } catch (error) {
      console.error("Error loading bills:", error);
      toast({
        title: "Error Loading Bills",
        description: "There was an error loading the bills. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Toggle bill expansion
  const toggleBillExpansion = (billNo: string) => {
    setExpandedBills(prev => ({
      ...prev,
      [billNo]: !prev[billNo]
    }));
  };

  // Delete a bill
  const deleteBill = (billNo: string) => {
    setBillToDelete(billNo);
    setShowDeleteConfirm(true);
  };

  // Confirm bill deletion
  const confirmDeleteBill = () => {
    if (!billToDelete) return;

    try {
      let storageKey = '';
      if (activeTab === 'feed') {
        storageKey = 'customerFeedBills';
      } else if (activeTab === 'medicine') {
        storageKey = 'customerMedicineBills';
      } else if (activeTab === 'chick') {
        storageKey = 'customerChickBills';
      }

      const savedBills = localStorage.getItem(storageKey);
      if (savedBills) {
        const parsedBills = JSON.parse(savedBills);
        const updatedBills = parsedBills.filter((bill: CustomerBill) => bill.billNo !== billToDelete);
        localStorage.setItem(storageKey, JSON.stringify(updatedBills));
        setBills(updatedBills);

        toast({
          title: "Bill Deleted",
          description: `Bill #${billToDelete} has been deleted.`
        });
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast({
        title: "Error Deleting Bill",
        description: "There was an error deleting the bill. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setBillToDelete(null);
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
              <h1 className="text-2xl font-bold text-neutral-800">Customer Bill Ledger</h1>
              <p className="text-neutral-600">Simplified bill information for customers</p>
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
            
            {bills.length === 0 ? (
              <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-neutral-600 mb-1">No Bills Found</h3>
                <p className="text-neutral-500">No customer bills have been created yet for this category.</p>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Item</TableHead>
                      {activeTab === 'feed' && <TableHead>Weight (kg)</TableHead>}
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.billNo}>
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
                        <TableCell>{bill.item}</TableCell>
                        {activeTab === 'feed' && <TableCell>{bill.weight} kg</TableCell>}
                        <TableCell>
                          <div className="flex gap-2">
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
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteBill(bill.billNo)}
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
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      {/* Customer Bill Print Modal */}
      {showPrintModal && selectedBill && (
        <CustomerBillPrint 
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
