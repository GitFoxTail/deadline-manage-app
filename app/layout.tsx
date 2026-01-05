import "./globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main className="">{children}</main>
      </body>
    </html>
  )
}