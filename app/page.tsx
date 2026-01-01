import { Table } from "@/components/table"

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl py-10 px-5 bg-teal-500 text-white">賞味期限管理アプリ</h1>
      <div>
        <Table/>
      </div>
    </div>
  )
}