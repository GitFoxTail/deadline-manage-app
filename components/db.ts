"use server"
import { neon } from "@neondatabase/serverless";

interface Item {
    name: string;
    deadline: string;
    category: number;
}

interface ItemForm {
    name: string;
    deadline: string;
    category: number;
}

export async function getData(user: string) {
    const sql = neon(process.env.DATABASE_URL as string);
    const data = await sql`SELECT * FROM deadlinemanage WHERE "user" = ${user}`;

    return data;
}

export async function insertData(
    user: string, 
    name: string, 
    deadline: string,
    category: number,
): Promise<{ id: number }> {
    const sql = neon(process.env.DATABASE_URL as string);

    const result = await sql`
        INSERT INTO deadlinemanage ("user", "name", "deadline", "category") 
        values (${user}, ${name}, ${deadline}, ${category}) 
        RETURNING id
    `;
    
    return { id: result[0].id};
}

export async function deleteData(id: number): Promise<void> {
    const sql = neon(process.env.DATABASE_URL as string);

    await sql`
        DELETE FROM deadlinemanage
        WHERE id = ${id}
    `;
}

export async function updateData(id: number, form: ItemForm): Promise<void> {   
    const sql = neon(process.env.DATABASE_URL as string);

    await sql`
        UPDATE deadlinemanage 
        SET 
            name = ${form.name}, 
            deadline = ${form.deadline},
            category = ${form.category}
        WHERE id = ${id}
    `;
}