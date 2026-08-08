'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function RegisterBeetlePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [gender, setGender] = useState('不明');
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState('');
  const [generation, setGeneration] = useState('CBF1');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newBeetle = {
      name,
      status,
      gender,
      weight: weight ? parseFloat(weight) : null,
      size: size ? parseFloat(size) : null,
      generation,
      memo,
    };

    const { error } = await supabase.from('beetles').insert([newBeetle]);

    if (error) {
      alert('登録に失敗しました: ' + error.message);
      setSaving(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-xs font-bold text-amber-400 underline">
          ➔ トップへ戻る
        </Link>
        <h1 className="text-lg font-bold text-amber-400">新規個体登録</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-4 text-xs">
        <div>
          <label className="block text-emerald-400 font-bold mb-1">個体名 / 種名 *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-emerald-400 font-bold mb-1">状態</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
            >
              <option value="幼虫">幼虫</option>
              <option value="前蛹">前蛹</option>
              <option value="蛹">蛹</option>
              <option value="成虫">成虫</option>
            </select>
          </div>

          <div>
            <label className="block text-emerald-400 font-bold mb-1">性別</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
            >
              <option value="オス">オス</option>
              <option value="メス">メス</option>
              <option value="不明">不明</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-emerald-400 font-bold mb-1">体重 (g)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
            />
          </div>
          <div>
            <label className="block text-emerald-400 font-bold mb-1">サイズ (mm)</label>
            <input
              type="number"
              step="0.1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
            />
          </div>
          <div>
            <label className="block text-emerald-400 font-bold mb-1">累代</label>
            <input
              type="text"
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-emerald-400 font-bold mb-1">血統 / メモ</label>
          <textarea
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="血統名や管理メモを入力"
            className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-100"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded shadow mt-2"
        >
          {saving ? '登録中...' : '新規登録する'}
        </button>
      </form>
    </main>
  );
}