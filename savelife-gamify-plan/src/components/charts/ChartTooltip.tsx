interface ChartTooltipProps {
    active?: boolean;
    payload?: { value: number; color?: string; name?: string }[];
    label?: string;
    prefix?: string;
}

export function ChartTooltip({ active, payload, label, prefix = '₹' }: ChartTooltipProps) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md px-4 py-3 shadow-2xl">
            {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="text-base font-bold text-foreground">
                    {prefix}{p.value.toLocaleString('en-IN')}
                </p>
            ))}
        </div>
    );
}
