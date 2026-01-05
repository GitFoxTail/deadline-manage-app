"use server"
import { neon } from "@neondatabase/serverless";

interface Item {
    name: string;
    deadline: string;
}

interface ItemForm {
    name: string;
    deadline: string;
}

export async function getData(user: string) {
    const sql = neon(process.env.DATABASE_URL as string);
    const data = await sql`SELECT * FROM deadlinemanage WHERE "user" = ${user}`;

    return data;
}

export async function insertData(
    user: string, 
    name: string, 
    deadline: string
): Promise<{ id: number }> {
    const sql = neon(process.env.DATABASE_URL as string);

    const result = await sql`
        INSERT INTO deadlinemanage ("user", "name", "deadline") 
        values (${user}, ${name}, ${deadline}) 
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
            deadline = ${form.deadline} 
        WHERE id = ${id}
    `;
}