// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bug, Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [beetles, setBeetles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBeetles() {
      const { data } = await supabase.from('beetles').select('*');
      if (data) setBeetles(data);
    }
    fetchBeetles();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-extrabold text-[#f0f7ef]">BEETLE MASTER'S GROVE</h1>
          <p className="text-xs text-[#8fa888]">SUPREME BREEDER MANAGEMENT SYSTEM</p>
        </div>
        <Link href="/register" className="bg-[#436e32] hover:bg-[#5b8c43] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
          <Plus size={18} /> 新規個体登録
        </Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <h2 className="text-lg font-bold mb-6 text-[#d4ebd0]">育成個体一覧 ({beetles.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beetles.map((beetle) => (
            <div key={beetle.id} className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] text-[#5f7d56] font-mono">ID: {beetle.id.slice(0, 8)}...</p>
                <Link href={`/beetle-edit?id=${beetle.id}`} className="text-xs text-[#82b366] hover:text-[#d4ebd0] font-bold underline">
                  編集する
                </Link>
              </div>
              
              <div className="w-full h-48 bg-[#0a1108] rounded-xl overflow-hidden flex items-center justify-center border border-[#1e3318] mb-4">
                {beetle.image_url ? (
                  <img src={beetle.image_url} alt={beetle.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[#5f7d56]">
                    <Bug size={36} className="mx-auto mb-1 opacity-40" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[#f0f7ef] mb-4">{beetle.name}</h3>
              <div className="flex items-center gap-2 text-xs text-[#8fa888] bg-[#0a1108] p-2 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[#82b366]"></span>
                管理ステータス: {beetle.status || '育成中'}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}