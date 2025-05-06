import React from 'react';

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

interface BillInvoicePrintProps {
  bill: Bill;
  onClose: () => void;
}

export function BillInvoicePrint({ bill, onClose }: BillInvoicePrintProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">INVOICE</h1>
          <p className="text-neutral-600">{bill.type.toUpperCase()} BILL</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-neutral-500">Invoice No:</p>
            <p className="font-semibold">{bill.billNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Date:</p>
            <p className="font-semibold">{formatDate(bill.billDate)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-neutral-500">Bill To:</p>
          <p className="font-semibold">{bill.to}</p>
        </div>
        
        <div className="mb-6">
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-medium text-neutral-500">Item</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-neutral-500">Qty</th>
                  {bill.type === 'feed' && (
                    <th className="text-right py-2 px-3 text-xs font-medium text-neutral-500">Weight</th>
                  )}
                  <th className="text-right py-2 px-3 text-xs font-medium text-neutral-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item) => (
                  <tr key={item.id} className="border-t border-neutral-200">
                    <td className="py-2 px-3">{item.item}</td>
                    <td className="py-2 px-3 text-right">{item.quantity} {bill.type === 'feed' ? 'bags' : 'units'}</td>
                    {bill.type === 'feed' && (
                      <td className="py-2 px-3 text-right">{item.weight} kg</td>
                    )}
                    <td className="py-2 px-3 text-right">₹{item.sellingTotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t border-neutral-200 bg-neutral-50">
                  <td colSpan={bill.type === 'feed' ? 3 : 2} className="py-2 px-3 text-right font-medium">Total:</td>
                  <td className="py-2 px-3 text-right font-bold">₹{bill.grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {bill.notes && (
          <div className="mb-6">
            <p className="text-sm text-neutral-500">Notes:</p>
            <p className="text-neutral-600">{bill.notes}</p>
          </div>
        )}
        
        <div className="mt-8 border-t border-neutral-200 pt-4 text-center">
          <p className="text-neutral-500 text-sm">Thank you for your business!</p>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
