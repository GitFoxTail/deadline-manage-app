"use server"
import { neon } from "@neondatabase/serverless";

interface Item {
    name: string;
    deadline: string;
}

export async function getData(user: string): Promise<Item[]> {
    const sql = neon(process.env.DATABASE_URL as string);
    const data = await sql`SELECT * FROM deadlinemanage WHERE "user" = ${user}`;

    return data.map(row => ({
        name: String(row.name),
        deadline: String(row.deadline),
    }));
}

export async function insertData(user: string) {
    const sql = neon(process.env.DATABASE_URL as string);
    const data = await sql`INSERT INTO deadlinemanage ("user", "name", "deadline") values (${user}, '', '2026-01-01') `;
}