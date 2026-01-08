"use client";

import { useState, useRef, useEffect } from 'react';

import { GalleryHorizontal, Trash2 } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { Plus } from "lucide-react";

import { deleteData, getData, insertData, updateData } from './db';

interface Item {
    id: number;
    user: string;
    name: string;
    deadline: string;
    category: number;
}

interface ItemForm {
    name: string;
    deadline: string;
    category: number;
}

const userName = "fox"

export const Table = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const deleteDialogRef = useRef<HTMLDialogElement>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Array<Item>>([]);
    const [form, setForm] = useState<ItemForm>({
        name: "",
        deadline: "",
        category: 0,
    })

    const [mode, setMode] = useState<"add" | "edit" | null>(null);
    const [editTargetId, setEditTargetId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [category, setCategory] = useState(0)

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            const result = await getData("fox");
            setItems(result.map(row => ({
                id: row.id,
                user: row.user,
                name: row.name,
                deadline: row.deadline,
                category: row.category,
            })));
            console.log(result);
        }
        fetchData();
        setLoading(false)
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
            category: 0,
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
            category: category,
        });

        dialogRef.current?.showModal();
    }

    const handleDeleteConfirm = async (id: number) => {
        deleteDialogRef.current?.showModal();
        setDeleteTargetId(id);
    }

    const closeDialog = () => dialogRef.current?.close();
    const closeDeleteDialog = () => deleteDialogRef.current?.close();

    const handleDeleteExecute = async () => {
        setLoading(true);
        setItems(items.filter((item) => item.id !== deleteTargetId));
        if (deleteTargetId) { await deleteData(deleteTargetId); }
        setLoading(false);
        closeDeleteDialog();
    }

    const handleSave = async () => {
        if (!mode) return;

        closeDialog();
        setLoading(true);
        if (mode === "add") {
            const inserted = await insertData(
                userName,
                form.name,
                form.deadline,
                form.category,
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
        setLoading(false);
    }

    return (
        <>
            <div className="text-lg grid grid-cols-3 m-3 gap-5 my-5">
                <button
                    className={`border border-3 rounded ${category === 0 ? "border-black bg-black text-white" : "border-gray-500"}`}
                    onClick={() => setCategory(0)}
                >タスク</button>
                <button
                    className={`border border-3 rounded ${category === 1 ? "border-black bg-black text-white" : "border-gray-500"}`}
                    onClick={() => setCategory(1)}
                >賞味期限</button>
                <button
                    className={`border border-3 rounded ${category === 2 ? "border-black bg-black text-white" : "border-gray-500"}`}
                    onClick={() => setCategory(2)}
                >その他</button>
            </div>
            <div className='justify-items-end'>
                <button
                    className="items-center flex  p-2 m-3 rounded bg-black text-white hover:cursor-pointer hover:bg-gray-500"
                    onClick={handleAdd}
                >
                    <Plus />
                </button>
            </div>
            <div className={`flex ms-5 ${loading ? "" : "hidden"}`}>
                <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                <div className="ms-2">Loading...</div>
            </div>
            {items.filter((e) => e.category === category).map((item) => {
                const deadline = new Date(item.deadline)
                const today = new Date();
                const remainingMs = deadline.getTime() - today.getTime();
                const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))

                return (
                    <div key={item.id} className="p-2 m-2 border border-2 rounded">
                        <div className='flex'>
                            <p className="text-base w-3/4" >期限まで<span className='font-bold px-1 text-blue-700 text-xl'>{remainingDays}</span>日（ {deadline.toLocaleDateString()}）</p>
                            <SquarePen
                                className='w-6 h-6 ms-6 text-black hover:text-gray-500 hover:cursor-pointer'
                                onClick={() => handleEdit(item)}
                            />
                            <Trash2
                                className='w-6 h-6 ms-3 text-black hover:text-gray-500 hover:cursor-pointer'
                                onClick={() => handleDeleteConfirm(item.id)}
                            />
                        </div>
                        <div className='flex flex-col mt-1'>
                            <p className="text-xl">{item.name}</p>
                        </div>
                    </div>
                )
            })}
            <dialog
                ref={deleteDialogRef}
                className="w-full h-1/3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border rounded"
            >
                <h1 className='text-2xl bg-black text-white p-2'>Detail</h1>
                <div className='text-xl p-2 my-5'>
                    選択したアイテムを削除しますか？
                </div>
                <div className='flex gap-5 justify-center p-2'>
                    <button
                        className='p-2 border rounded'
                        onClick={closeDeleteDialog}
                    >
                        Cancel
                    </button>
                    <button
                        className='px-3 py-2 border rounded bg-black text-white'
                        onClick={handleDeleteExecute}
                    >
                        Delete
                    </button>
                </div>
            </dialog>
            <dialog
                ref={dialogRef}
                className="w-full h-2/3 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border rounded"
            >
                <h1 className='text-2xl bg-black text-white p-2'>Detail</h1>
                <div className='text-xl p-2'>
                    <h2 className='text-xl mt-5'>Category</h2>
                    <div className="text-lg grid grid-cols-3 gap-3 mt-2">
                        <button
                            className={`border border-3 rounded ${form.category === 0 ? "border-black bg-black text-white" : "border-gray-500"}`}
                            onClick={() => setForm({ ...form, category: 0 })}
                        >タスク</button>
                        <button
                            className={`border border-3 rounded ${form.category === 1 ? "border-black bg-black text-white" : "border-gray-500"}`}
                            onClick={() => setForm({ ...form, category: 1 })}
                        >賞味期限</button>
                        <button
                            className={`border border-3 rounded ${form.category === 2 ? "border-black bg-black text-white" : "border-gray-500"}`}
                            onClick={() => setForm({ ...form, category: 2 })}
                        >その他</button>
                    </div>
                    <h2 className='text-xl mt-5'>Content</h2>
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