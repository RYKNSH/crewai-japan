import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: LucideIcon;
    emoji?: string;
    title: string;
    description: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    gradient?: string;
}

export function EmptyState({
    icon: Icon,
    emoji,
    title,
    description,
    primaryAction,
    secondaryAction,
    gradient = "from-violet-500 to-purple-600",
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Animated Icon Container */}
            <div className="relative w-24 h-24 mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-3xl animate-pulse`} />
                <div className={`absolute inset-2 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                    {emoji ? (
                        <span className="text-4xl">{emoji}</span>
                    ) : Icon ? (
                        <Icon className="h-10 w-10 text-white" />
                    ) : null}
                </div>
            </div>

            {/* Text Content */}
            <h3 className="text-xl font-bold gradient-text text-center">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-center text-sm">
                {description}
            </p>

            {/* Action Buttons */}
            {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {primaryAction && (
                        <Button
                            onClick={primaryAction.onClick}
                            className="shadow-lg"
                        >
                            {primaryAction.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="outline"
                            onClick={secondaryAction.onClick}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
