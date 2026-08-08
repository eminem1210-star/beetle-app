'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Trash2, Plus, Calendar } from "lucide-react";
import Link from "next/link";

function EditContent() {
  const id = useSearchParams().get('id');
  const [beetle, setBeetle] = useState<any>(null);
  const [newLog, setNewLog] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('beetles').select('*').eq('id', id).single().then(({ data }) => setBeetle(data));
  }, [id]);

  const handleUpdate = async () => {
    await supabase.from('beetles').update(beetle).eq('id', id);
    alert('保存しました');
  };

  const addLog = async () => {
    const updatedHistory = [...(beetle.history || []), { date: new Date().toLocaleDateString(), text: newLog }];
    await supabase.from('beetles').update({ history: updatedHistory }).eq('id', id);
    setBeetle({ ...beetle, history: updatedHistory });
    setNewLog('');
  };

  const handleDelete = async () => {
    if (confirm('本当に削除しますか？')) {
      await supabase.from('beetles').delete().eq('id', id);
      window.location.href = '/';
    }
  };

  if (!beetle) return <div className="text-white p-10">読み込み中...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
        <label className="text-xs text-[#8fa888]">個体名</label>
        <input className="w-full bg-transparent text-xl font-bold outline-none" value={beetle.name} onChange={(e) => setBeetle({...beetle, name: e.target.value})} />
        <button onClick={handleUpdate} className="mt-4 w-full bg-[#82b366] py-2 rounded-lg font-bold">変更を保存</button>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
        <h2 className="text-sm font-bold text-[#d4ebd0] mb-3">成長タイムライン・履歴</h2>
        {beetle.history?.map((h: any, i: number) => (
          <div key={i} className="border-b border-[#2d4424] py-2 text-sm text-[#8fa888]">
            <span className="text-[#82b366] mr-2">{h.date}</span>{h.text}
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <input className="flex-1 bg-[#0a1108] p-2 rounded text-sm" placeholder="新しい記録..." value={newLog} onChange={(e) => setNewLog(e.target.value)} />
          <button onClick={addLog} className="bg-[#436e32] px-3 rounded"><Plus size={18} /></button>
        </div>
      </div>

      <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-[#441414] text-red-400 py-3 rounded-xl font-bold">
        <Trash2 size={18} /> この個体を削除
      </button>
    </div>
  );
}

export default function EditPage() {
  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4">
      <Link href="/" className="flex items-center gap-1 text-[#8fa888] mb-4 text-sm"><ArrowLeft size={16} /> 管理ダッシュボードに戻る</Link>
      <Suspense><EditContent /></Suspense>
    </div>
  );
}