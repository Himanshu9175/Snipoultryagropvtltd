import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Wheat } from "lucide-react";

interface FeedPrice {
  feedType: string;
  price: number;
  date: string;
}

export function FeedPriceSummary() {
  const [latestPrices, setLatestPrices] = useState<FeedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load stored invoices and extract latest prices
    try {
      const storedInvoices = localStorage.getItem('feedPurchaseInvoices');
      if (storedInvoices) {
        const invoices = JSON.parse(storedInvoices);
        
        // Sort invoices by date (newest first)
        invoices.sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        
        // Feed types to track
        const feedTypes = ['Pre-PS', 'Starter-SC(M)', 'Starter-SC(P)', 'Finisher-FP'];
        
        // Find the latest price for each feed type
        const priceMap: {[key: string]: FeedPrice} = {};
        
        // Process all invoices and track latest prices for each feed type
        for (const invoice of invoices) {
          for (const item of invoice.items) {
            // Only process if this is a feed type we're tracking
            if (feedTypes.includes(item.item)) {
              // Calculate cost per kg (including freight)
              const totalBags = invoice.items.reduce((total: number, i: any) => total + i.quantity, 0);
              const freightPerBag = totalBags > 0 ? invoice.freightCharges / totalBags : 0;
              const costPerKg = (item.rate + freightPerBag) / 50;
              
              // If we haven't seen this feed type yet, or this invoice is newer
              if (!priceMap[item.item] || 
                  new Date(invoice.invoiceDate) > new Date(priceMap[item.item].date)) {
                priceMap[item.item] = {
                  feedType: item.item,
                  price: costPerKg,
                  date: invoice.invoiceDate
                };
              }
            }
          }
        }
        
        // Convert the price map to an array and sort by feed type
        const prices = Object.values(priceMap);
        prices.sort((a, b) => feedTypes.indexOf(a.feedType) - feedTypes.indexOf(b.feedType));
        
        setLatestPrices(prices);
      }
    } catch (error) {
      console.error('Error loading feed prices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Card className="w-full shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wheat className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium">Latest Feed Prices</h3>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-full"></div>
            <div className="h-4 bg-neutral-100 rounded w-5/6"></div>
            <div className="h-4 bg-neutral-100 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (latestPrices.length === 0) {
    return (
      <Card className="w-full shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wheat className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium">Latest Feed Prices</h3>
          </div>
          <p className="text-neutral-500 text-sm">No feed purchase data available yet. Add invoices in the Material Purchase section.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-card hover:shadow-card-hover transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium">Latest Feed Prices</h3>
          </div>
          <span className="text-xs text-neutral-500">
            Last updated: {new Date(latestPrices[0]?.date || '').toLocaleDateString()}
          </span>
        </div>
        
        <div className="space-y-2">
          {latestPrices.map((price) => (
            <div key={price.feedType} className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 last:border-0">
              <span className="text-sm font-medium">{price.feedType}</span>
              <div className="text-right">
                <span className="text-sm font-bold text-primary">₹{price.price.toFixed(2)}</span>
                <span className="block text-xs text-neutral-500">per kg</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
