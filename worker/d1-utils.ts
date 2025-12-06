/**
 * D1 Database Utilities for AppChahiye
 * Provides typed helpers for common database operations
 */

// D1Database interface (matches Cloudflare Workers runtime)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any;

// Generic type for database row - using object for flexibility
export type Row = object;

/**
 * Execute a query and return all results
 */
export async function queryAll<T extends Row>(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<T[]> {
    const result = await db.prepare(sql).bind(...params).all();
    return (result.results ?? []) as T[];
}

/**
 * Execute a query and return the first result
 */
export async function queryFirst<T extends Row>(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<T | null> {
    const result = await db.prepare(sql).bind(...params).first();
    return (result ?? null) as T | null;
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE) and return metadata
 */
export async function execute(
    db: D1Database,
    sql: string,
    params: unknown[] = []
): Promise<D1Result> {
    return await db.prepare(sql).bind(...params).run();
}

/**
 * Insert a row and return the inserted data
 */
export async function insert<T extends Row>(
    db: D1Database,
    table: string,
    data: T
): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');

    await db.prepare(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    ).bind(...values).run();

    return data;
}

/**
 * Update a row by ID
 */
export async function updateById<T extends Row>(
    db: D1Database,
    table: string,
    id: string,
    updates: Partial<T>
): Promise<boolean> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return false;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const result = await db.prepare(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`
    ).bind(...values).run();

    return (result.meta?.changes ?? 0) > 0;
}

/**
 * Delete a row by ID
 */
export async function deleteById(
    db: D1Database,
    table: string,
    id: string
): Promise<boolean> {
    const result = await db.prepare(
        `DELETE FROM ${table} WHERE id = ?`
    ).bind(id).run();

    return (result.meta?.changes ?? 0) > 0;
}

/**
 * Get a row by ID
 */
export async function getById<T extends Row>(
    db: D1Database,
    table: string,
    id: string
): Promise<T | null> {
    const result = await db.prepare(
        `SELECT * FROM ${table} WHERE id = ?`
    ).bind(id).first();
    return (result ?? null) as T | null;
}

/**
 * Check if a row exists by ID
 */
export async function existsById(
    db: D1Database,
    table: string,
    id: string
): Promise<boolean> {
    const result = await db.prepare(
        `SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`
    ).bind(id).first();

    return result !== null;
}

/**
 * Get all rows from a table
 */
export async function getAll<T extends Row>(
    db: D1Database,
    table: string
): Promise<T[]> {
    const result = await db.prepare(`SELECT * FROM ${table}`).all();
    return (result.results ?? []) as T[];
}

/**
 * D1Result type for execute operations
 */
interface D1Result {
    success: boolean;
    meta?: {
        changes?: number;
        last_row_id?: number;
        duration?: number;
    };
}
