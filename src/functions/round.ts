export function round(x: number, precision = 10) {
    return Math.round(x * precision) / precision
}