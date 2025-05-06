import { MenuCard } from "@/components/menu-card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FeedPriceSummary } from "@/components/feed-price-summary";
import { ItemStockSummary } from "@/components/item-stock-summary";
import { menuItems } from "@/lib/menu-data";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 pb-16 md:pb-0">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Dashboard</h1>
          <p className="text-neutral-600 mt-2">Select a module to begin working</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FeedPriceSummary />
          </div>
          <div className="lg:col-span-1">
            <ItemStockSummary />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              path={item.path}
              iconBgColor={item.iconBgColor}
              iconColor={item.iconColor}
              isPlaceholder={item.isPlaceholder}
            />
          ))}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
