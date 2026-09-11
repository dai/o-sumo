import React from 'react';
import { Link } from 'react-router-dom';
import MetaHead from './components/MetaHead';
import { CURRENT_BANZUKE_PATH, CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from './lib/archive-basho-data';
import { torikumiArchive } from './lib/torikumi-data';

export default function NotFoundPage() {
  const currentBashoName = `${torikumiArchive.year}年${torikumiArchive.bashoName}`;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <MetaHead>
        <title>404 ページが見つかりません | o-sumo</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。" />
      </MetaHead>

      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <span className="text-6xl font-black text-rose-500 tracking-wider">404</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-3 text-gray-900 dark:text-white">
          ページが見つかりません
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-8">
          お探しのページは削除されたか、URLが変更された可能性があります。<br />
          下記のリンクから最新の大相撲情報をご覧ください。
        </p>

        {/* Highlighted current basho section */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl p-5 mb-8 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {currentBashoName} 情報
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link
              to={CURRENT_RESULT_PATH}
              className="px-3 py-2 text-center text-sm font-medium text-rose-950 dark:text-rose-100 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-800/30 transition-colors"
            >
              取組・星取表
            </Link>
            <Link
              to={CURRENT_SCHEDULE_PATH}
              className="px-3 py-2 text-center text-sm font-medium text-rose-950 dark:text-rose-100 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-800/30 transition-colors"
            >
              取組予定
            </Link>
            <Link
              to={CURRENT_BANZUKE_PATH}
              className="px-3 py-2 text-center text-sm font-medium text-rose-950 dark:text-rose-100 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-800/30 transition-colors"
            >
              幕内番付
            </Link>
          </div>
        </div>

        {/* General links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            to="/"
            className="px-5 py-2.5 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            トップページへ
          </Link>
          <Link
            to="/archives/"
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            場所別アーカイブ
          </Link>
          <Link
            to="/rikishi/"
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            力士名鑑
          </Link>
        </div>
      </div>
    </div>
  );
}
