import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, TrendingUp, BarChart3, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function LiftingBook() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 pb-16 md:pb-0">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-50 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Lifting Book</h1>
              <p className="text-neutral-600">Track product movement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold mb-4">Lifting Book Dashboard</h2>
          <p className="text-neutral-600">Track and analyze all product movement and inventory changes.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Total Lifting</h3>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold mt-2">1,250</p>
              <p className="text-sm text-neutral-600 mt-1">Units this month</p>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Average Daily</h3>
                <BarChart3 className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-3xl font-bold mt-2">42</p>
              <p className="text-sm text-neutral-600 mt-1">Units per day</p>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Growth Rate</h3>
                <ArrowUpDown className="h-5 w-5 text-success-500" />
              </div>
              <p className="text-3xl font-bold mt-2">+15%</p>
              <p className="text-sm text-neutral-600 mt-1">From last month</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Lifting Records</h3>
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-neutral-50 p-3 border-b border-neutral-200 font-medium text-sm">
                <div>Date</div>
                <div>Product</div>
                <div>Quantity</div>
                <div>Status</div>
              </div>
              
              <div className="divide-y divide-neutral-200">
                <div className="grid grid-cols-4 p-3 text-sm">
                  <div>May 04, 2025</div>
                  <div>Product A</div>
                  <div>150 units</div>
                  <div><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></div>
                </div>
                
                <div className="grid grid-cols-4 p-3 text-sm">
                  <div>May 03, 2025</div>
                  <div>Product B</div>
                  <div>75 units</div>
                  <div><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></div>
                </div>
                
                <div className="grid grid-cols-4 p-3 text-sm">
                  <div>May 02, 2025</div>
                  <div>Product C</div>
                  <div>200 units</div>
                  <div><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Pending</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
