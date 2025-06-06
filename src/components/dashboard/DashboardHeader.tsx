
import { Button } from "@/components/ui/button";
import { BookOpen, Settings } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationButton from "@/components/dashboard/NotificationButton";

interface DashboardHeaderProps {
  title: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

const DashboardHeader = ({ title, showSettings = false, onSettingsClick }: DashboardHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationButton />
          {showSettings && onSettingsClick && (
            <Button variant="ghost" size="sm" onClick={onSettingsClick}>
              <Settings className="h-5 w-5" />
            </Button>
          )}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
