import React from 'react';
import { cn } from '../../lib/utils';

interface DockProps {
    children: React.ReactNode;
    className?: string;
    panelHeight?: number;
}

interface DockItemProps {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

interface DockLabelProps {
    className?: string;
    children: React.ReactNode;
}

interface DockIconProps {
    className?: string;
    children: React.ReactNode;
}

function Dock({ children, className, panelHeight = 80 }: DockProps) {
    return (
        <div
            className={cn(
                'mx-auto flex w-fit items-end gap-4 rounded-2xl px-4 overflow-visible',
                className
            )}
            style={{ height: panelHeight }}
            role="toolbar"
            aria-label="Application dock"
        >
            {children}
        </div>
    );
}

function DockItem({ children, className, onClick }: DockItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            tabIndex={0}
            aria-haspopup="true"
            className={cn(
                'group relative inline-flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center transition-colors',
                className
            )}
        >
            {children}
        </button>
    );
}

function DockLabel({ children, className }: DockLabelProps) {
    return (
        <span
            role="tooltip"
            className={cn(
                'pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white',
                className
            )}
        >
            {children}
        </span>
    );
}

function DockIcon({ children, className }: DockIconProps) {
    return <div className={cn('flex items-center justify-center w-8 h-8', className)}>{children}</div>;
}

export { Dock, DockIcon, DockItem, DockLabel };
