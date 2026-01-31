import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700";
    const variantClasses = {
        text: "h-4 w-full rounded",
        rect: "h-24 w-full rounded-2xl",
        circle: "h-12 w-12 rounded-full",
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Skeleton className="md:col-span-12 lg:col-span-6 xl:col-span-5 h-[240px]" />
                <div className="md:col-span-6 lg:col-span-3 xl:col-span-3 flex flex-col gap-6">
                    <Skeleton className="h-full" />
                </div>
                <div className="md:col-span-6 lg:col-span-3 xl:col-span-4 flex flex-col gap-6">
                    <Skeleton className="h-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Velocity Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    {/* Risks Skeleton */}
                    <Skeleton className="h-64 h-fullw-full" />
                </div>
                {/* Insights Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <Skeleton variant="circle" className="flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="text" className="w-1/3" />
                            <Skeleton variant="text" className="w-1/4" />
                        </div>
                        <Skeleton variant="text" className="w-20" />
                        <Skeleton variant="text" className="w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48" />
            ))}
        </div>
    );
};
