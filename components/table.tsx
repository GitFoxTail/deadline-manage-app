"use client";

import { useState, useRef, useEffect } from 'react';

import { Trash2 } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { Plus } from "lucide-react";

import { getData, insertData } from './db';

interface Item {
    name: string;
    deadline: string;
}

export const Table = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [items, setItems] = useState<Array<Item>>([]);
    const [editName, setEditName] = useState("");
    const [editDeadline, setEditDeadline] = useState("");
    const [editIndex, setEditIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getData("fox");
            setItems(result);
            console.log(result);
        }
        fetchData();
    }, []);

    const handleEdit = (item: Item, index: number) => {
        setEditName(item.name);
        setEditDeadline(item.deadline);
        setEditIndex(index);
        dialogRef.current?.showModal();
    }

    const handleDelete = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    }

    const handleAdd = async () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = ('0' + (today.getMonth() + 1)).slice(-2);
        const dd = ('0' + today.getDate()).slice(-2);
        const formatedToday = `${yyyy}-${mm}-${dd}`
        const emptyItem: Item = {
            "name": "",
            "deadline": formatedToday
        };

        const newIndex = items.length;

        setItems([...items, emptyItem]);
        setEditIndex(newIndex);

        await insertData("fox")
        
        dialogRef.current?.showModal();
    }

    const closeDialog = () => {
        dialogRef.current?.close();
    }

    const handleSave = () => {
        if (editIndex === null) return;
        const newItems = [...items];
        newItems[editIndex] = {
            name: editName,
            deadline: editDeadline,
        };
        setItems(newItems)
        closeDialog();
    }

    return (
        <>
            <div
                className="items-center flex gap-3 border border-3 w-32 p-3 rounded-2xl hover: cursor-pointer bg-gray-200"
                onClick={handleAdd}
            >
                <Plus />
                <p className="text-2xl">追加</p>
            </div>
            {items.map((item, index) => {
                const deadline = new Date(item.deadline)
                const today = new Date();
                const remainingMs = deadline.getTime() - today.getTime();
                const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))

                return (
                    <div key={index} className="p-5 m-3 border border-teal-500 border-5 rounded-2xl w-3/4 ">
                        <p className="text-lg" >期限: {deadline.toLocaleDateString()}</p>
                        <div className='flex mt-2'>
                            <p className="text-2xl w-4/5">{item.name}</p>
                            <SquarePen
                                className='w-8 h-8 ms-5 text-black hover:text-gray-500 hover:cursor-pointer'
                                onClick={() => handleEdit(item, index)}
                            />
                            <Trash2
                                className='w-8 h-8 ms-5 text-black hover:text-gray-500 hover:cursor-pointer'
                                onClick={() => handleDelete(index)}
                            />
                        </div>
                        <p className="text-xl mt-2">締め切りまであと <span className='font-bold px-2 text-teal-700'>{remainingDays}</span>日</p>
                    </div>
                )
            })}
            {/* {datas.map((data, index) => {
                return(
                <div key={index}>
                <div>{data.id}</div>
                <div>{data.text}</div>
                </div>
                )
            })} */}
            <dialog
                ref={dialogRef}
                className="w-1/2 h-1/2 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border rounded-2xl p-5"
            >
                <h1 className='text-3xl'>内容</h1>
                {editIndex !== null ? (
                    <div className='text-xl'>
                        <h2 className='text-2xl mt-5'>名前</h2>
                        <input
                            className='border rounded p-1 w-full'
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                        <h2 className='text-2xl mt-5'>期限</h2>
                        <input
                            className='border rounded p-1 w-full'
                            type='date'
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                        />
                    </div>
                ) : (
                    <p>no data</p>
                )}
                <div className='flex gap-5 mt-5 justify-end'>
                    <button
                        className='mt-5 px-4 py-2 border rounded'
                        onClick={closeDialog}
                    >
                        キャンセル
                    </button>
                    <button
                        className='mt-5 px-4 py-2 border rounded bg-teal-700 text-white'
                        onClick={handleSave}
                    >
                        保存
                    </button>
                </div>
            </dialog>
        </>
    )
}