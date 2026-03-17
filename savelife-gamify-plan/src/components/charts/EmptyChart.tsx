interface EmptyChartProps {
    message?: string;
    height?: string;
}

export function EmptyChart({ message = 'No spending data for this period', height = 'h-40' }: EmptyChartProps) {
    return (
        <div className={`${height} flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/40`}>
            <span className="text-4xl opacity-30">📊</span>
            <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
        </div>
    );
}
