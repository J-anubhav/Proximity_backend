/**
 * Generate a random 6-character alphanumeric room code
 * Uses uppercase letters and numbers, excluding confusing characters (0, O, I, L)
 */
export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Excluded: 0, O, I, L, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Normalize room code to uppercase for case-insensitive matching
 */
export function normalizeRoomCode(code: string): string {
    return code.toUpperCase().trim();
}

/**
 * Validate room code format (6 alphanumeric characters)
 */
export function isValidRoomCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/i.test(code);
}
