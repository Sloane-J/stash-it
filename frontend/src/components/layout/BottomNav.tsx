import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, FolderOpen, User } from 'lucide-react';

// Navigation item type
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isSpecial?: boolean; // For the center "Create" button
}

// Navigation items configuration
const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'create',
    label: 'New',
    icon: Plus,
    path: '/create',
    isSpecial: true,
  },
  {
    id: 'collections',
    label: 'Collections',
    icon: FolderOpen,
    path: '/collections',
  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a nav item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle navigation
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex flex-col items-center justify-center
                gap-1 px-3 py-2 rounded-lg
                touch-target transition-colors
                ${active ? 'text-primary' : 'text-muted-foreground'}
                ${!item.isSpecial && 'hover:text-foreground'}
                ${item.isSpecial && 'relative -mt-4'}
              `}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Special styling for Create button */}
              {item.isSpecial ? (
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center
                      w-14 h-14 rounded-full
                      bg-primary text-primary-foreground
                      shadow-lg hover:shadow-xl
                      transition-all hover:scale-105 active:scale-95
                    `}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium mt-1">
                    {item.label}
                  </span>
                </div>
              ) : (
                // Regular nav items
                <>
                  <Icon
                    className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`}
                  />
                  <span
                    className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}