// src/pages/SnippetDetailPage.tsx

import { ChevronLeft, Heart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SnippetWithTags } from "@/types/snippet-ui.types";
import "./SnippetDetailPage.css";

export function SnippetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [snippet, setSnippet] = useState<SnippetWithTags | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);

	// Fetch snippet data
	useEffect(() => {
		if (!id) {
			setError("Invalid snippet id");
			setIsLoading(false);
			return;
		}

		const fetchSnippet = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/snippets/${id}`,
					{
						credentials: "include",
					},
				);

				if (!response.ok) {
					throw new Error("Failed to fetch snippet");
				}

				const data = await response.json();
				setSnippet(data.snippet);
			} catch (err) {
				console.error("Error fetching snippet:", err);
				setError(err instanceof Error ? err.message : "Failed to load snippet");
			} finally {
				setIsLoading(false);
			}
		};

		fetchSnippet();
	}, [id]);

	// Loading state
	if (isLoading) {
		return (
			<div className="snippet-detail-loading">
				<div className="loading-spinner" />
				<p>Loading snippet...</p>
			</div>
		);
	}

	// Error state
	if (error || !snippet) {
		return (
			<div className="snippet-detail-error">
				<p className="error-message">Failed to load snippet</p>
				{error && <p className="error-details">{error}</p>}
				<button onClick={() => navigate("/")} className="btn-secondary">
					Back to Home
				</button>
			</div>
		);
	}

	// Safe metadata access
	const metadata = snippet.metadata ?? {};
	const hasImage = Boolean(metadata.favicon || metadata.image);

	// Get snippet type color
	const getTypeColor = (type: string) => {
		const colors = {
			quote: "var(--clr-quote)",
			note: "var(--clr-note)",
			source: "var(--clr-source)",
			summary: "var(--clr-summary)",
			link: "var(--clr-link)",
		};
		return colors[type as keyof typeof colors] || "var(--clr-primary-a0)";
	};

	// Handle favorite toggle
	const handleToggleFavorite = () => {
		setIsFavorite(!isFavorite);
		// TODO: API call to update favorite status
	};

	// Handle add to collection
	const handleAddToCollection = () => {
		// TODO: Open collection modal
		console.log("Add to collection clicked");
	};

	// Format date helper
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Get type-specific metadata for left column
	const getLeftMetadata = () => {
		switch (snippet.type) {
			case "quote":
				return (
					<>
						{metadata.source && (
							<div className="metadata-item">
								<span className="metadata-label">Source</span>
								<span className="metadata-value">{metadata.source}</span>
							</div>
						)}
						{metadata.author && (
							<div className="metadata-item">
								<span className="metadata-label">Author</span>
								<span className="metadata-value">{metadata.author}</span>
							</div>
						)}
						{metadata.page && (
							<div className="metadata-item">
								<span className="metadata-label">Page</span>
								<span className="metadata-value">{metadata.page}</span>
							</div>
						)}
					</>
				);

			case "note":
				return (
					<>
						{metadata.topic && (
							<div className="metadata-item">
								<span className="metadata-label">Topic</span>
								<span className="metadata-value">{metadata.topic}</span>
							</div>
						)}
					</>
				);

			case "source":
				return (
					<>
						{metadata.author && (
							<div className="metadata-item">
								<span className="metadata-label">Author</span>
								<span className="metadata-value">{metadata.author}</span>
							</div>
						)}
						{metadata.title && (
							<div className="metadata-item">
								<span className="metadata-label">Title</span>
								<span className="metadata-value">{metadata.title}</span>
							</div>
						)}
						{metadata.year && (
							<div className="metadata-item">
								<span className="metadata-label">Year</span>
								<span className="metadata-value">{metadata.year}</span>
							</div>
						)}
						{metadata.citation && (
							<div className="metadata-item">
								<span className="metadata-label">Citation</span>
								<span className="metadata-value">{metadata.citation}</span>
							</div>
						)}
					</>
				);

			case "summary":
				return (
					<>
						{metadata.originalSource && (
							<div className="metadata-item">
								<span className="metadata-label">Summarized From</span>
								<span className="metadata-value">
									{metadata.originalSource}
								</span>
							</div>
						)}
						{metadata.originalLength && (
							<div className="metadata-item">
								<span className="metadata-label">Original Length</span>
								<span className="metadata-value">
									{metadata.originalLength}
								</span>
							</div>
						)}
					</>
				);

			case "link":
				return (
					<>
						{metadata.url && (
							<div className="metadata-item">
								<span className="metadata-label">URL</span>
								<a
									href={metadata.url}
									target="_blank"
									rel="noopener noreferrer"
									className="metadata-value metadata-link"
								>
									{new URL(metadata.url).hostname}
								</a>
							</div>
						)}
						{metadata.siteName && (
							<div className="metadata-item">
								<span className="metadata-label">Site</span>
								<span className="metadata-value">{metadata.siteName}</span>
							</div>
						)}
					</>
				);

			default:
				return null;
		}
	};

	return (
		<div className="snippet-detail-page">
			{/* SECTION 1: Header */}
			<div className="snippet-detail-header">
				{hasImage ? (
					<div
						className="snippet-detail-header-image"
						style={{
							backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%), url(${metadata.image || metadata.favicon})`,
						}}
					>
						{/* Header Icons - Overlay on Image */}
						<div className="snippet-detail-header-icons">
							{/* Back Button - Top Left */}
							<button
								className="icon-button icon-button-back"
								onClick={() => navigate("/")}
								aria-label="Go back"
							>
								<ChevronLeft size={24} />
							</button>

							{/* Add to Collection - Top Right */}
							<button
								className="icon-button icon-button-add"
								onClick={handleAddToCollection}
								aria-label="Add to collection"
							>
								<Plus size={24} />
							</button>

							{/* Favorite Button - Bottom Right */}
							<button
								className={`icon-button icon-button-favorite ${isFavorite ? "is-favorite" : ""}`}
								onClick={handleToggleFavorite}
								aria-label={
									isFavorite ? "Remove from favorites" : "Add to favorites"
								}
							>
								<Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
							</button>
						</div>
					</div>
				) : (
					<div
						className="snippet-detail-header-solid"
						style={{ backgroundColor: getTypeColor(snippet.type) + "1A" }}
					>
						{/* Header Icons - On Solid Background */}
						<div className="snippet-detail-header-icons">
							{/* Back Button */}
							<button
								className="icon-button icon-button-back"
								onClick={() => navigate("/")}
								aria-label="Go back"
							>
								<ChevronLeft size={24} />
							</button>

							{/* Add to Collection */}
							<button
								className="icon-button icon-button-add"
								onClick={handleAddToCollection}
								aria-label="Add to collection"
							>
								<Plus size={24} />
							</button>

							{/* Favorite Button */}
							{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
								className={`icon-button icon-button-favorite ${isFavorite ? "is-favorite" : ""}`}
								onClick={handleToggleFavorite}
								aria-label={
									isFavorite ? "Remove from favorites" : "Add to favorites"
								}
							>
								<Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
							</button>
						</div>

						{/* Type Icon and Label */}
						<div className="snippet-detail-header-type">
							<span className="type-label">{snippet.type.toUpperCase()}</span>
						</div>
					</div>
				)}
			</div>

			{/* Centered content container */}
			<div className="snippet-detail-container">
				{/* SECTION 2: Metadata */}
				<div className="snippet-detail-metadata">
					<div className="metadata-grid">
						{/* Left Column - Type-specific metadata */}
						<div className="metadata-column metadata-left">
							{getLeftMetadata()}
						</div>

						{/* Right Column - Universal metadata */}
						<div className="metadata-column metadata-right">
							<div className="metadata-item">
								<span className="metadata-label">Created</span>
								<span className="metadata-value">
									{formatDate(snippet.created_at)}
								</span>
							</div>

							<div className="metadata-item">
								<span className="metadata-label">Type</span>
								<span
									className="type-badge"
									style={{ backgroundColor: getTypeColor(snippet.type) }}
								>
									{snippet.type}
								</span>
							</div>

							{snippet.updated_at &&
								snippet.updated_at !== snippet.created_at && (
									<div className="metadata-item">
										<span className="metadata-label">Last Edited</span>
										<span className="metadata-value">
											{formatDate(snippet.updated_at)}
										</span>
									</div>
								)}
						</div>
					</div>
				</div>

				{/* SECTION 3: Content */}
				<div className="snippet-detail-content">
					<p>Content Section - Coming in Step 4</p>
					<p>{snippet.content}</p>
				</div>

				{/* SECTION 4: Tags */}
				<div className="snippet-detail-tags">
					<p>Tags Section - Coming in Step 5</p>
				</div>

				{/* SECTION 5: Actions */}
				<div className="snippet-detail-actions">
					<p>Actions Section - Coming in Step 6</p>
				</div>
			</div>
		</div>
	);
}
