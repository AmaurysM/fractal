import { BiCode, BiSolidFileDoc } from "react-icons/bi";
import { Snippet } from "../lib/types";

export const SnippetTile = ({
    snippet,
    onSnippetSelect,
    selectedSnippet
}: {
    snippet: Snippet;
    onSnippetSelect: (snippet: Snippet) => void;
    selectedSnippet?: Snippet;
}) => {
    const isSelected = selectedSnippet?.Id === snippet.Id;

    const getLanguageBadgeColor = (language?: string) => {
        const colors: { [key: string]: string } = {
            JavaScript: 'badge-warning',
            TypeScript: 'badge-info',
            Python: 'badge-success',
            Java: 'badge-error',
            'C++': 'badge-secondary',
            'C#': 'badge-primary',
            C: 'badge-neutral',
            Kotlin: 'badge-accent',
            'Node.js': 'badge-warning'
        };
        return colors[language || ''] || 'badge-ghost';
    };

    return (
        <div
            className={`group relative cursor-pointer transition-all duration-200 ${
                isSelected
                    ? "bg-primary/10 border-l-4 border-primary shadow-sm"
                    : "hover:bg-base-200/50 border-l-4 border-transparent"
            }`}
            onClick={() => onSnippetSelect(snippet)}
        >
            <div className="flex items-center gap-3 p-3">
                {/* Icon */}
                <div className="avatar placeholder">
                    <div className={`w-8 h-8 rounded-lg p-2 ${
                        isSelected 
                            ? "bg-primary text-primary-content" 
                            : "bg-base-200 text-base-content group-hover:bg-base-300"
                    }`}>
                        <BiCode className="w-4 h-4" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${
                                isSelected ? "text-primary" : "text-base-content"
                            }`}>
                                {snippet.Title}
                            </h4>
                            
                            {snippet.Description && (
                                <p className={`text-xs mt-1 truncate ${
                                    isSelected ? "text-primary/70" : "text-base-content/60"
                                }`}>
                                    {snippet.Description}
                                </p>
                            )}
                        </div>

                        {/* Language Badge */}
                        {snippet.Language && (
                            <div className={`badge badge-sm ${
                                isSelected 
                                    ? "badge-primary badge-outline" 
                                    : getLanguageBadgeColor(snippet.Language)
                            }`}>
                                {snippet.Language}
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-base-content/50">
                        <div className="flex items-center gap-1">
                            <BiSolidFileDoc className="w-3 h-3" />
                            <span>{snippet.Text.split('\n').length} lines</span>
                        </div>
                        {snippet.Text.length > 0 && (
                            <span>{snippet.Text.length} chars</span>
                        )}
                    </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                isSelected 
                    ? "opacity-0" 
                    : "opacity-0 group-hover:opacity-100 bg-base-content/5"
            }`}></div>
        </div>
    );
};