import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";

export function SearchPage() {
	const [searchQuery] = useState("");
	const [results] = useState([]);

	if (searchQuery && results.length === 0) {
		return (
			<EmptyState
				icon={SearchIcon}
				title="No results found"
				description="Try different keywords or adjust your search filters. You can also create a new snippet if you didn't find what you were looking for."
				actionLabel="Clear Search"
				onAction={() => {}}
			/>
		);
	}

	return (
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div className="text-center space-y-3">
				<h1 className="text-3xl font-bold text-foreground">Search</h1>
				<p className="text-lg text-muted-foreground">
					Search functionality coming soon
				</p>
			</div>
		</div>
	);
}
