'use client';

import Link from 'next/link';

export default function ChartsPage() {
  // デモ用データ（マット交換ごとの体重推移データ）
  const records = [
    { date: '2026-06-01', weight: 12.5, note: 'マット交換 1回目' },
    { date: '2026-06-20', weight: 18.2, note: '順調に成長中' },
    { date: '2026-07-10', weight: 25.4, note: 'マット交換 2回目' },
    { date: '2026-07-30', weight: 31.0, note: 'フン増加、状態良好' },
  ];

  const maxWeight = 40; // グラフの最大表示基準(g)

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">📊 体重推移（幼虫計測ログ）</h1>
          <Link href="/" className="text-sm text-stone-500 hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        {/* 簡易体重グラフ */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
          <h2 className="text-lg font-semibold text-stone-700 mb-2">カブト-01 の成長記録</h2>
          <div className="space-y-3">
            {records.map((rec, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm font-medium text-stone-600">
                  <span>{rec.date}（{rec.note}）</span>
                  <span className="font-bold text-emerald-700">{rec.weight} g</span>
                </div>
                {/* ゲージ状の簡易グラフ */}
                <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden border border-stone-200">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(rec.weight / maxWeight) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 計測データ一覧 */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">計測履歴一覧</h2>
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-2">日付</th>
                <th className="py-2">体重 (g)</th>
                <th className="py-2">メモ</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={i} className="border-b border-stone-100">
                  <td className="py-2">{rec.date}</td>
                  <td className="py-2 font-bold text-stone-800">{rec.weight} g</td>
                  <td className="py-2">{rec.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}