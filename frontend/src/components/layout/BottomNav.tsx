import { FolderOpen, Home, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	path: string;
	isSpecial?: boolean;
}

const navItems: NavItem[] = [
	{ id: "home", label: "Home", icon: Home, path: "/" },
	{
		id: "create",
		label: "Create",
		icon: Plus,
		path: "/create",
		isSpecial: true,
	},
	{
		id: "collections",
		label: "Collections",
		icon: FolderOpen,
		path: "/collections",
	},
];

export function BottomNav() {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path: string) => {
		return path === "/"
			? location.pathname === "/"
			: location.pathname.startsWith(path);
	};

	return (
		<nav className="sticky bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
			{/* Sticky Bottom Nav Bar */}
			<div className="flex items-center justify-between w-full h-16 px-4 max-w-md mx-auto">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);

					if (item.isSpecial) {
						return (
							<button
								key={item.id}
								onClick={() => navigate(item.path)}
								className="relative flex items-center justify-center -translate-y-2"
								aria-label={item.label}
							>
								<div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90">
									<Icon className="w-7 h-7" strokeWidth={2.5} />
								</div>
							</button>
						);
					}

					return (
						<button
							key={item.id}
							onClick={() => navigate(item.path)}
							className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-300 active:scale-95"
							aria-label={item.label}
						>
							<Icon
								className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
								strokeWidth={active ? 2.5 : 2}
							/>
							<span
								className={`text-[10px] uppercase tracking-wider font-bold transition-all ${active ? "text-primary opacity-100" : "text-muted-foreground opacity-70"}`}
							>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
