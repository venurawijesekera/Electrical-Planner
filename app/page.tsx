import { BoardCanvas } from "@/components/board/BoardCanvas";
import { Sidebar } from "@/components/palette/Sidebar";

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <BoardCanvas />
      </div>
    </main>
  );
}
