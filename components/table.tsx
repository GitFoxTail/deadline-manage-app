"use client";

import { useState, useRef, useEffect } from 'react';

import { Trash2 } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { Plus } from "lucide-react";

import { deleteData, getData, insertData, updateData } from './db';

interface Item {
    id: number;
    user: string;
    name: string;
    deadline: string;
}

interface ItemForm {
    name: string;
    deadline: string;
}

const userName = "fox"

export const Table = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [items, setItems] = useState<Array<Item>>([]);
    const [form, setForm] = useState<ItemForm>({
        name: "",
        deadline: ""
    })

    const [mode, setMode] = useState<"add" | "edit" | null>(null);
    const [editTargetId, setEditTargetId] = useState<number | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDeadline, setEditDeadline] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            const result = await getData("fox");
            setItems(result.map(row => ({
                id: row.id,
                user: row.user,
                name: row.name,
                deadline: row.deadline,
            })));
            console.log(result);
        }
        fetchData();
    }, []);

    const handleAdd = async () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = ('0' + (today.getMonth() + 1)).slice(-2);
        const dd = ('0' + today.getDate()).slice(-2);

        setMode("add");
        setEditTargetId(null);
        setForm({
            name: "",
            deadline: `${yyyy}-${mm}-${dd}`,
        })

        dialogRef.current?.showModal();
    }

    const handleEdit = (item: Item) => {
        setMode("edit");
        setEditTargetId(item.id);

        const today = new Date(item.deadline);
        const yyyy = today.getFullYear();
        const mm = ('0' + (today.getMonth() + 1)).slice(-2);
        const dd = ('0' + today.getDate()).slice(-2);

        setForm({
            name: item.name,
            deadline: `${yyyy}-${mm}-${dd}`,
        });

        dialogRef.current?.showModal();
    }

    const handleDelete = async (id: number) => {
        setItems(items.filter((item) => item.id !== id));
        await deleteData(id);
    }

    const closeDialog = () => dialogRef.current?.close();

    const handleSave = async () => {
        if (!mode) return;

        if (mode === "add") {
            const inserted = await insertData(
                userName,
                form.name,
                form.deadline
            );

            setItems([
                ...items,
                {
                    id: inserted.id,
                    user: userName,
                    ...form,
                },
            ]);
        };


        if (mode === "edit" && editTargetId !== null) {
            await updateData(editTargetId, form);

            setItems(items.map(item =>
                item.id === editTargetId
                    ? { ...item, ...form }
                    : item
            ));
        }

        closeDialog();
    }

    return (
        <>
            <div
                className="w-1/4 items-center flex  p-2 m-3 rounded bg-black text-white hover:cursor-pointer hover:bg-gray-500"
                onClick={handleAdd}
            >
                <Plus />
                <p className="text-xl">Add</p>
            </div>
            {items.map((item) => {
                const deadline = new Date(item.deadline)
                const today = new Date();
                const remainingMs = deadline.getTime() - today.getTime();
                const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))

                return (
                    <div key={item.id} className="p-5 m-3 border border-3 rounded">
                        <div  className='flex'>
                        <p className="text-base w-3/4" >期限: {deadline.toLocaleDateString()}</p>
                        <SquarePen
                            className='w-6 h-6 ms-6 text-black hover:text-gray-500 hover:cursor-pointer'
                            onClick={() => handleEdit(item)}
                        />
                        <Trash2
                            className='w-6 h-6 ms-3 text-black hover:text-gray-500 hover:cursor-pointer'
                            onClick={() => handleDelete(item.id)}
                        />
                        </div>
                        <div className='flex flex-col mt-1'>
                            <p className="text-xl">{item.name}</p>
                        </div>
                        <p className="text-base mt-1">締め切りまであと<span className='font-bold px-1 text-blue-700'>{remainingDays}</span>日</p>
                    </div>
                )
            })}
            <dialog
                ref={dialogRef}
                className="w-full h-2/3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border rounded"
            >
                <h1 className='text-2xl bg-black text-white p-2'>Detail</h1>
                <div className='text-xl p-2'>
                    <h2 className='text-xl'>Content</h2>
                    <input
                        className='border rounded p-1 w-full'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <h2 className='text-xl mt-5'>Deadline</h2>
                    <input
                        className='border rounded p-1 w-full'
                        type='date'
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                </div>
                <div className='flex gap-5 justify-end p-2'>
                    <button
                        className='p-2 border rounded'
                        onClick={closeDialog}
                    >
                        Cancel
                    </button>
                    <button
                        className='px-3 py-2 border rounded bg-black text-white'
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </dialog>
        </>
    )
}