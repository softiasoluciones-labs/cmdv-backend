/**
 * Parse JWT duration strings ("8h", "7d", "30m", "60s", or raw seconds)
 * into seconds. Used to advertise `expiresIn` to the client.
 *
 * Compatible with the same syntax that `jsonwebtoken` accepts in its
 * `expiresIn` option, plus raw numbers for completeness.
 */
export function parseJwtDurationToSeconds(input: string | number): number {
    if (typeof input === 'number') return input;

    const trimmed = String(input).trim().toLowerCase();
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);

    const match = trimmed.match(/^(\d+)\s*(s|m|h|d|w|y)$/);
    if (!match) {
        throw new Error(`Invalid JWT duration format: "${input}"`);
    }

    const value = parseInt(match[1] as string, 10);
    const unit = match[2] as string;
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        case 'w': return value * 60 * 60 * 24 * 7;
        case 'y': return value * 60 * 60 * 24 * 365;
        default: throw new Error(`Invalid JWT duration unit: "${unit}"`);
    }
}
