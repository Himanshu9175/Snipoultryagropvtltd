import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { menuItems } from "@/lib/menu-data";
import { Home as HomeIcon } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();
  
  // Filter out placeholder menu items
  const activeMenuItems = menuItems.filter(item => !item.isPlaceholder).slice(0, 5);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 z-10 md:hidden">
      <div className="flex justify-between items-center">
        <Link href="/">
          <div className={cn(
            "flex flex-col items-center p-2 rounded-md",
            location === "/" ? "text-primary" : "text-neutral-500 hover:text-neutral-800"
          )}>
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        {activeMenuItems.map((item) => (
          <Link key={item.id} href={item.path}>
            <div className={cn(
              "flex flex-col items-center p-2 rounded-md",
              location === item.path ? "text-primary" : "text-neutral-500 hover:text-neutral-800"
            )}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.title.split(" ")[0]}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
