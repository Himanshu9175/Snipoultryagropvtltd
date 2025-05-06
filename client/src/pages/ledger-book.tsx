import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ArrowLeft, CreditCard, DollarSign, PieChart, Users, FileText } from "lucide-react";
import { Link } from "wouter";
import { BottomNav } from "@/components/ui/bottom-nav";
import { PartyManagement } from "@/components/party-management";
import { PartyTransactions } from "@/components/party-transactions";

export default function LedgerBook() {
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
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Ledger Book</h1>
              <p className="text-neutral-600">Financial records and entries</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <Tabs defaultValue="party-transactions">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="transactions" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="party-transactions" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Party Ledger
              </TabsTrigger>
              <TabsTrigger value="parties" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Party Management
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Transactions</h2>
                <p className="text-neutral-600">View and manage all financial transactions.</p>
                
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 p-3 border-b border-neutral-200">
                    <h3 className="font-medium text-primary">Recent Transactions</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-neutral-200">
                        <div className="flex items-center">
                          <div className="mr-3 bg-primary-50 text-primary p-2 rounded-md">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Payment Received</p>
                            <p className="text-xs text-neutral-500">Invoice #1234</p>
                          </div>
                        </div>
                        <p className="font-medium text-success-500">+₹1,250.00</p>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-neutral-200">
                        <div className="flex items-center">
                          <div className="mr-3 bg-primary-50 text-primary p-2 rounded-md">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Expense</p>
                            <p className="text-xs text-neutral-500">Office Supplies</p>
                          </div>
                        </div>
                        <p className="font-medium text-destructive">-₹350.00</p>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                          <div className="mr-3 bg-primary-50 text-primary p-2 rounded-md">
                            <PieChart className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Budget Update</p>
                            <p className="text-xs text-neutral-500">Monthly Review</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="party-transactions">
              <PartyTransactions />
            </TabsContent>
            
            <TabsContent value="parties">
              <PartyManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
