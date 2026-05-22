export default function Heading({
    title,
    description,
    className,
}: {
    title: string;
    description: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <h2 className="text-base leading-snug font-medium">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
}
