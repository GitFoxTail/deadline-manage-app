import { Table } from "@/components/table"

export default function Page() {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl p-5 bg-black text-white">期限管理アプリ</h1>
      <div>
        <Table/>
      </div>
    </div>
  )
}