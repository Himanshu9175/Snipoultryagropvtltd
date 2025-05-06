import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Package, Pill, Baby } from "lucide-react";

interface StockItem {
  name: string;
  quantity: number;
  // For feed items
  weight?: number;
}

export function ItemStockSummary() {
  const [activeTab, setActiveTab] = useState<'feed' | 'medicine' | 'chick'>('feed');
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStockData();
  }, [activeTab]);

  const loadStockData = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load purchase invoices
      let purchaseKey = '';
      if (activeTab === 'feed') {
        purchaseKey = 'feedPurchaseInvoices';
      } else if (activeTab === 'medicine') {
        purchaseKey = 'medicinePurchaseInvoices';
      } else if (activeTab === 'chick') {
        purchaseKey = 'chickPurchaseInvoices';
      }
      
      const purchaseData = localStorage.getItem(purchaseKey);
      const purchaseInvoices = purchaseData ? JSON.parse(purchaseData) : [];
      
      // Load sales invoices
      let salesKey = '';
      if (activeTab === 'feed') {
        salesKey = 'feedBillInvoices';
      } else if (activeTab === 'medicine') {
        salesKey = 'medicineBillInvoices';
      } else if (activeTab === 'chick') {
        salesKey = 'chickBillInvoices';
      }
      
      const salesData = localStorage.getItem(salesKey);
      const salesInvoices = salesData ? JSON.parse(salesData) : [];
      
      // Calculate current stock by taking purchases and subtracting sales
      const stockMap: {[key: string]: StockItem} = {};
      
      // Add purchase quantities
      purchaseInvoices.forEach((invoice: any) => {
        invoice.items.forEach((item: any) => {
          if (!stockMap[item.item]) {
            stockMap[item.item] = {
              name: item.item,
              quantity: 0,
              weight: activeTab === 'feed' ? 0 : undefined
            };
          }
          
          stockMap[item.item].quantity += item.quantity;
          if (activeTab === 'feed') {
            stockMap[item.item].weight = (stockMap[item.item].weight || 0) + (item.quantity * 50); // 50kg per bag
          }
        });
      });
      
      // Subtract sales quantities
      salesInvoices.forEach((invoice: any) => {
        invoice.items.forEach((item: any) => {
          if (stockMap[item.item]) {
            stockMap[item.item].quantity -= item.quantity;
            if (activeTab === 'feed' && stockMap[item.item].weight !== undefined) {
              stockMap[item.item].weight = (stockMap[item.item].weight || 0) - (item.quantity * 50); // 50kg per bag
            }
          }
        });
      });
      
      // Convert map to array and sort by name
      const stockArray = Object.values(stockMap)
        .filter(item => item.quantity > 0) // Only show items with positive stock
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setItems(stockArray);
      setLoading(false);
      
    } catch (error) {
      console.error("Error loading stock data:", error);
      setError("Failed to load stock data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-neutral-800">Current Stock Summary</CardTitle>
        <CardDescription>Overview of available stock for all items</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "feed" | "medicine" | "chick")}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="feed" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
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
          
          {loading ? (
            <div className="py-8 text-center text-neutral-500">
              <div className="animate-pulse flex justify-center">
                <div className="h-6 w-24 bg-neutral-200 rounded-md"></div>
              </div>
              <p className="mt-2">Loading stock data...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="border border-dashed border-neutral-300 rounded-md p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">No stock data available. Add purchases to see current stock.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  {activeTab === 'feed' && (
                    <TableHead className="text-right">Weight (kg)</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity} {activeTab === 'feed' ? 'bags' : 'units'}</TableCell>
                    {activeTab === 'feed' && (
                      <TableCell className="text-right">{item.weight} kg</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
