'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Save, Trash2, Plus, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function EditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [beetle, setBeetle] = useState<any>(null);
  const [logStatus, setLogStatus] = useState('幼虫');
  const [logWeight, setLogWeight] = useState('');
  const [logText, setLogText] = useState('');

  useEffect(() => {
    async function fetchBeetle() {
      if (!id) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        alert('データが見つからないか、権限がありません');
        router.push('/');
      } else {
        setBeetle(data);
      }
    }
    fetchBeetle();
  }, [id, router]);

  // 履歴から体重データを抽出してグラフ用に変換
  const chartData = beetle?.history
    ?.filter((h: any) => h.text && h.text.includes('体重:'))
    ?.map((h: any) => {
      const match = h.text.match(/体重:\s*([\d.]+)g/);
      return {
        date: h.date,
        weight: match ? parseFloat(match[1]) : null
      };
    })
    ?.filter((d: any) => d.weight !== null) || [];

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
    }
  };

  const deleteLog = async (indexToDelete: number) => {
    if (!confirm('この記録を削除しますか？')) return;
    const updatedHistory = beetle.history.filter((_: any, i: number) => i !== indexToDelete);
    const { error } = await supabase.from('beetles').update({ history: updatedHistory }).eq('id', id);
    if (error) alert('削除失敗: ' + error.message);
    else setBeetle({ ...beetle, history: updatedHistory });
  };

  const handleDelete = async () => {
    if (!confirm('本当にこの個体を削除しますか？')) return;
    await supabase.from('beetles').delete().eq('id', id);
    router.push('/');
  };

  if (!beetle) return <div className="p-10 text-center text-[#8fa888]">読み込み中...</div>;

  return (
    <form onSubmit={handleUpdate} className="max-w-lg mx-auto space-y-6">
      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
        <label className="text-xs text-[#8fa888]">個体名 / 管理名</label>
        <input type="text" value={beetle.name || ''} onChange={(e) => setBeetle({...beetle, name: e.target.value})} className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef]" />
        <button type="submit" className="mt-4 w-full bg-[#82b366] hover:bg-[#93c47d] text-[#0d160b] py-3 rounded-xl font-extrabold shadow-lg">変更を保存</button>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
        <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
          {beetle.image_url ? <img src={beetle.image_url} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
        </div>
        <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-3 rounded-xl font-bold cursor-pointer">
          <Camera className="inline mr-2" /> 写真を変更
          <input type="file" accept="image/*" capture="environment" onChange={(e) => {
            const file = e.target.files?.[0];
            if(file) {
              const reader = new FileReader();
              reader.onloadend = () => setBeetle({...beetle, image_url: reader.result});
              reader.readAsDataURL(file);
            }
          }} className="hidden" />
        </label>
      </div>

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#8fa888]">ステータス</label>
            <select value={beetle.status || '幼虫'} onChange={(e) => setBeetle({...beetle, status: e.target.value})} className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">性別</label>
            <select value={beetle.gender || '不明'} onChange={(e) => setBeetle({...beetle, gender: e.target.value})} className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
              {['不明','オス','メス'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8fa888]">体重 (g)</label>
          <input type="number" step="0.1" value={beetle.weight || ''} onChange={(e) => setBeetle({...beetle, weight: e.target.value})} className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]" />
        </div>
      </div>

      {/* 体重推移グラフセクション */}
      {chartData.length > 0 && (
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-3">
          <h2 className="text-sm font-bold text-[#d4ebd0] flex items-center gap-2">
            <TrendingUp size={16} className="text-[#82b366]" /> 体重推移グラフ
          </h2>
          <div className="w-full h-48 bg-[#0a1108] p-3 rounded-xl border border-[#1e3318]">
            <ResponsiveContainer width="100% " height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3318" />
                <XAxis dataKey="date" stroke="#8fa888" fontSize={10} />
                <YAxis stroke="#8fa888" fontSize={10} unit="g" />
                <Tooltip contentStyle={{ backgroundColor: '#142011', borderColor: '#2d4424', borderRadius: '8px', color: '#f0f7ef' }} />
                <Line type="monotone" dataKey="weight" stroke="#82b366" strokeWidth={2} dot={{ fill: '#82b366' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
        <h2 className="text-sm font-bold text-[#d4ebd0]">成長タイムライン</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {beetle.history?.map((h: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b border-[#2d4424] pb-2 text-sm text-[#8fa888]">
              <div><span className="text-[#82b366] mr-2 font-bold">{h.date}</span><span>{h.text}</span></div>
              <button type="button" onClick={() => deleteLog(i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-[#2d4424] space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={logStatus} onChange={(e) => setLogStatus(e.target.value)} className="bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df]">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" step="0.1" placeholder="体重 (g)" value={logWeight} onChange={(e) => setLogWeight(e.target.value)} className="bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df]" />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="メモ (例: 2令から3令へ換える)" value={logText} onChange={(e) => setLogText(e.target.value)} className="flex-1 bg-[#0a1108] border border-[#2d4424] p-2 rounded-lg text-sm text-[#e2e8df]" />
            <button type="button" onClick={addLog} className="bg-[#436e32] text-white px-4 rounded-lg font-bold"><Plus size={20} /></button>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-[#441414] text-[#e88888] py-3 rounded-xl font-bold shadow-lg">
        <Trash2 size={18} /> この個体を削除
      </button>
    </form>
  );
}

export default function EditPage() {
  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm"><ArrowLeft size={16} /> ダッシュボードに戻る</Link>
      <Suspense fallback={<div className="p-10 text-center text-[#8fa888]">読み込み中...</div>}>
        <EditContent />
      </Suspense>
    </div>
  );
}