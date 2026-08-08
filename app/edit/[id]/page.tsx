import { supabase } from '../../../lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditBeetlePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: beetle, error } = await supabase
    .from('beetles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !beetle) {
    return (
      <div className="p-4 text-white">
        <p>個体が見つかりませんでした。</p>
        <Link href="/" className="text-blue-400 underline">← トップへ戻る</Link>
      </div>
    );
  }

  // 更新処理
  async function updateBeetle(formData: FormData) {
    'use server';

    const name = formData.get('name');
    const status = formData.get('status');
    const gender = formData.get('gender');
    const weight = formData.get('weight');
    const size = formData.get('size');
    const lineage = formData.get('lineage');
    const mat = formData.get('mat');
    const memo = formData.get('memo');

    await supabase
      .from('beetles')
      .update({
        name,
        status,
        gender,
        weight: weight ? Number(weight) : null,
        size: size ? Number(size) : null,
        lineage,
        mat,
        memo,
      })
      .eq('id', id);

    redirect('/');
  }

  // 削除処理
  async function deleteBeetle() {
    'use server';

    await supabase
      .from('beetles')
      .delete()
      .eq('id', id);

    redirect('/');
  }

  return (
    <div className="p-4 max-w-md mx-auto text-white">
      <div className="mb-4">
        <Link href="/" className="text-orange-400 text-sm underline">← トップへ戻る</Link>
      </div>
      
      <h1 className="text-xl font-bold mb-4 text-center text-orange-400">個体編集・削除</h1>
      
      <form action={updateBeetle} className="space-y-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
        <div>
          <label className="block text-sm mb-1 text-emerald-400">個体名 / ♂♀ *</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={beetle.name || ''} 
            required 
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-emerald-400">状態</label>
            <select 
              name="status" 
              defaultValue={beetle.status || '幼虫'} 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="幼虫">幼虫</option>
              <option value="前蛹">前蛹</option>
              <option value="蛹">蛹</option>
              <option value="成虫">成虫</option>
              <option value="羽化">羽化</option>
              <option value="死亡">死亡</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-emerald-400">性別</label>
            <select 
              name="gender" 
              defaultValue={beetle.gender || '不明'} 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="不明">不明</option>
              <option value="オス">オス</option>
              <option value="メス">メス</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs mb-1 text-emerald-400">体重 (g)</label>
            <input 
              type="number" 
              step="0.1" 
              name="weight" 
              defaultValue={beetle.weight || ''} 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white" 
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-emerald-400">サイズ (mm)</label>
            <input 
              type="number" 
              step="0.1" 
              name="size" 
              defaultValue={beetle.size || ''} 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white" 
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-emerald-400">累代</label>
            <input 
              type="text" 
              name="lineage" 
              defaultValue={beetle.lineage || ''} 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-emerald-400">使用マット / 菌糸</label>
          <select 
            name="mat" 
            defaultValue={beetle.mat || '完熟マット'} 
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
          >
            <option value="完熟マット">完熟マット</option>
            <option value="発酵マット">発酵マット</option>
            <option value="きのこマット">きのこマット</option>
            <option value="菌糸ビン (PP)">菌糸ビン (PP)</option>
            <option value="菌糸ビン (ブロー)">菌糸ビン (ブロー)</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-emerald-400">血統 / メモ</label>
          <textarea 
            name="memo" 
            rows={3}
            defaultValue={beetle.memo || ''} 
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded font-bold transition"
        >
          変更を保存する
        </button>
      </form>

      <form action={deleteBeetle} className="mt-6 pt-4 border-t border-gray-800">
        <button 
          type="submit" 
          className="w-full bg-red-600/80 hover:bg-red-600 text-white p-2 rounded text-sm transition"
        >
          この個体を削除する
        </button>
      </form>
    </div>
  );
}