import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MenuCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path?: string;
  iconBgColor: string;
  iconColor: string;
  isPlaceholder?: boolean;
}

export function MenuCard({
  icon: Icon,
  title,
  description,
  path,
  iconBgColor,
  iconColor,
  isPlaceholder = false
}: MenuCardProps) {
  const CardContent = () => (
    <div 
      className={cn(
        "card-item bg-white rounded-xl shadow-card hover:shadow-card-hover p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]",
        isPlaceholder && "border-2 border-dashed border-neutral-200"
      )}
    >
      <div className={cn(
        "w-16 h-16 flex items-center justify-center rounded-full mb-4",
        iconBgColor,
        iconColor
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className={cn(
        "font-semibold text-lg mb-2",
        isPlaceholder ? "text-neutral-400" : "text-neutral-800"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-sm",
        isPlaceholder ? "text-neutral-400" : "text-neutral-500"
      )}>
        {description}
      </p>
    </div>
  );

  if (isPlaceholder) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div><CardContent /></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coming Soon</AlertDialogTitle>
            <AlertDialogDescription>
              This feature is currently in development and will be available in a future update.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (path) {
    return (
      <Link href={path}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
