'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [name, setName] = useState('');
  const [type, setType] = useState('カブトムシ');
  const [gender, setGender] = useState('オス');
  const [status, setStatus] = useState('幼虫');
  const [bloodline, setBloodline] = useState('');
  const [container, setContainer] = useState('800cc');
  const [memo, setMemo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBeetleData(id);
    }
  }, [id]);

  const fetchBeetleData = async (targetId: string) => {
    try {
      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name || '');
        setType(data.type || 'カブトムシ');
        setGender(data.gender || 'オス');
        setStatus(data.status || '幼虫');
        setBloodline(data.bloodline || '');
        setContainer(data.container || '800cc');
        setMemo(data.memo || '');
        setImageUrl(data.image_url || '');
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      let updatedImageUrl = imageUrl;

      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('beetle-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('beetle-images')
          .getPublicUrl(fileName);

        updatedImageUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('beetles')
        .update({
          name,
          type,
          gender,
          status,
          bloodline,
          container,
          memo,
          image_url: updatedImageUrl,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('この個体を削除してもよろしいですか？')) return;

    try {
      const { error } = await supabase.from('beetles').delete().eq('id', id);
      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました。');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-amber-400">個体の編集・詳細</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">名前・管理番号</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="カブトムシ">カブトムシ</option>
            <option value="オオクワガタ">オオクワガタ</option>
            <option value="ヒラタクワガタ">ヒラタクワガタ</option>
            <option value="ノコギリクワガタ">ノコギリクワガタ</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">性別</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="オス">オス</option>
            <option value="メス">メス</option>
            <option value="不明">不明</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">状態</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="幼虫">幼虫</option>
            <option value="前蛹">前蛹</option>
            <option value="蛹">蛹</option>
            <option value="成虫">成虫</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">血統・系統</label>
          <input
            type="text"
            value={bloodline}
            onChange={(e) => setBloodline(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            placeholder="例: 〇〇血統 / 〇〇ライン"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">使用ビン（容器）</label>
          <select
            value={container}
            onChange={(e) => setContainer(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="800cc">800cc</option>
            <option value="1100cc">1100cc</option>
            <option value="1400cc">1400cc</option>
            <option value="1500cc">1500cc</option>
            <option value="2300cc">2300cc</option>
            <option value="3000cc">3000cc以上</option>
            <option value="other">その他・ケース</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">現在の画像</label>
          {imageUrl ? (
            <img src={imageUrl} alt="個体画像" className="w-32 h-32 object-cover rounded mb-2 border border-slate-700" />
          ) : (
            <p className="text-xs text-slate-500 mb-2">画像なし</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            rows={3}
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition"
          >
            {loading ? '更新中...' : '変更を保存'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition"
          >
            削除
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">読み込み中...</div>}>
      <EditContent />
    </Suspense>
  );
}