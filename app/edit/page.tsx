// app/edit/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Save, Trash2, Plus, Info } from "lucide-react";
import Link from "next/link";

function EditContent() {
  const id = useSearchParams().get('id');
  const [beetle, setBeetle] = useState<any>(null);
  const [logStatus, setLogStatus] = useState('幼虫');
  const [logWeight, setLogWeight] = useState('');
  const [logText, setLogText] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('beetles').select('*').eq('id', id).single().then(({ data }) => setBeetle(data));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBeetle({ ...beetle, image_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('beetles').update({
      name: beetle.name,
      status: beetle.status,
      weight: beetle.weight ? Number(beetle.weight) : null,
      gender: beetle.gender,
      image_url: beetle.image_url,
      pedigree: beetle.pedigree,
      generation: beetle.generation,
      source: beetle.source,
    }).eq('id', id);

    if (error) alert('更新失敗: ' + error.message);
    else alert('変更を保存しました！');
  };

  const addLog = async () => {
    const textPart = `ステータス: ${logStatus}${logWeight ? ` / 体重: ${logWeight}g` : ''}${logText ? ` - ${logText}` : ''}`;
    const newEntry = { date: new Date().toLocaleDateString('ja-JP'), text: textPart };
    const updatedHistory = [...(beetle.history || []), newEntry];

    const { error } = await supabase.from('beetles').update({ 
      history: updatedHistory,
      status: logStatus,
      weight: logWeight ? Number(logWeight) : beetle.weight
    }).eq('id', id);

    if (error) {
      alert('ログ追加失敗: ' + error.message);
    } else {
      setBeetle({ ...beetle, history: updatedHistory, status: logStatus, weight: logWeight ? Number(logWeight) : beetle.weight });
      setLogWeight('');
      setLogText('');
      alert('タイムラインに記録を追加しました！');
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当にこの個体を削除しますか？')) return;
    await supabase.from('beetles').delete().eq('id', id);
    window.location.href = '/';
  };

  if (!beetle) return <div className="p-10 text-center text-[#8fa888]">読み込み中...</div>;

  return (
    <form onSubmit={handleUpdate} className="max-w-lg mx-auto space-y-6">
      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
        <label className="text-xs text-[#8fa888]">個体名 / 管理名</label>
        <input 
          type="text" 
          value={beetle.name || ''} 
          onChange={(e) => setBeetle({...beetle, name: e.target.value})}
          className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef]" 
        />
        <button type="submit" className="mt-4 w-full bg-[#82b366] hover:bg-[#93c47d] text-[#0d160b] py-3 rounded-xl font-extrabold shadow-lg">
          <Save size={16} className="inline mr-1" /> 変更を保存
        </button>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
        <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
          {beetle.image_url ? <img src={beetle.image_url} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
        </div>
        <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-3 rounded-xl font-bold cursor-pointer">
          <Camera className="inline mr-2" /> 写真を変更 / 撮影
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#8fa888]">ステータス</label>
            <select value={beetle.status || '幼虫'} onChange={(e) => setBeetle({...beetle, status: e.target.value})}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">性別</label>
            <select value={beetle.gender || '不明'} onChange={(e) => setBeetle({...beetle, gender: e.target.value})}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
              {['不明','オス','メス'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8fa888]">体重 (g)</label>
          <input type="number" step="0.1" value={beetle.weight || ''} onChange={(e) => setBeetle({...beetle, weight: e.target.value})}
            className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]" />
        </div>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-3">
        <h2 className="text-sm font-bold text-[#d4ebd0] flex items-center gap-2"><Info size={16}/> 血統・管理情報</h2>
        <input type="text" value={beetle.pedigree || ''} onChange={(e) => setBeetle({...beetle, pedigree: e.target.value})} placeholder="血統名" className="w-full bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" value={beetle.generation || ''} onChange={(e) => setBeetle({...beetle, generation: e.target.value})} placeholder="累代" className="bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
          <input type="text" value={beetle.source || ''} onChange={(e) => setBeetle({...beetle, source: e.target.value})} placeholder="入手先" className="bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
        </div>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
        <h2 className="text-sm font-bold text-[#d4ebd0]">成長タイムライン・履歴</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {beetle.history?.map((h: any, i: number) => (
            <div key={i} className="border-b border-[#2d4424] pb-2 text-sm text-[#8fa888]">
              <span className="text-[#82b366] mr-2 font-bold">{h.date}</span><span>{h.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#2d4424] space-y-3">
          <p className="text-xs text-[#8fa888]">新しい成長記録を追加</p>
          <div className="grid grid-cols-2 gap-2">
            <select value={logStatus} onChange={(e) => setLogStatus(e.target.value)}
              className="bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df]">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" step="0.1" placeholder="体重 (g)" value={logWeight} onChange={(e) => setLogWeight(e.target.value)}
              className="bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df] outline-none" />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="メモ（例: 菌糸ビン交換など）" value={logText} onChange={(e) => setLogText(e.target.value)}
              className="flex-1 bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df] outline-none" />
            <button type="button" onClick={addLog} className="bg-[#436e32] hover:bg-[#5b8c43] text-white px-4 rounded-lg font-bold flex items-center justify-center">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-[#441414] hover:bg-[#5c1c1c] text-[#e88888] py-3 rounded-xl font-bold shadow-lg">
        <Trash2 size={18} /> この個体を削除
      </button>
    </form>
  );
}

export default function EditPage() {
  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm">
        <ArrowLeft size={16} /> 管理ダッシュボードに戻る
      </Link>
      <Suspense fallback={<div className="p-10 text-center text-[#8fa888]">読み込み中...</div>}>
        <EditContent />
      </Suspense>
    </div>
  );
}