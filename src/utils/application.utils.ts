const parseTimeToMs = (value: string | undefined, defaultMs: number): number => {
    if (!value) return defaultMs;

    // Si ya es número puro
    if (!isNaN(Number(value))) return Number(value);

    const match = value.match(/^(\d+)(s|m|h)$/);
    if (!match) return defaultMs;

    const num = Number(match[1]);
    const unit = match[2];

    switch (unit) {
        case "s":
            return num * 1000;
        case "m":
            return num * 60 * 1000;
        case "h":
            return num * 60 * 60 * 1000;
        default:
            return defaultMs;
    }
};

export { parseTimeToMs };