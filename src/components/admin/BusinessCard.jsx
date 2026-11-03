import { useEffect, useState } from 'react';
import {
  Building2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  ExternalLink,
  Eye,
  TrendingUp
} from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import { getBusinessStats } from '../../lib/analytics';
import { getBusinessUrl } from '../../config/app';
import { isSafeImageUrl } from '../../lib/validation';

export default function BusinessCard({ business, onEdit, onToggleActive, onDelete }) {
  const { id, name, business_name, slug, logo_url, category, is_active } = business;
  const displayName = name || business_name || 'Untitled Business';
  const businessUrl = getBusinessUrl(slug);

  const [copied, setCopied] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [stats, setStats] = useState({
    pageVisits: 0,
    googleClicks: 0,
    conversionRate: '0.0%',
  });

  useEffect(() => {
    let active = true;

    getBusinessStats(id, 'all')
      .then((result) => {
        if (active && result) setStats(result);
      })
      .catch((error) => {
        console.error('Failed to load business analytics:', error);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(businessUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Header: Logo, Name, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logo_url && !logoFailed && isSafeImageUrl(logo_url) ? (
              <img
                src={logo_url}
                alt={`${displayName} logo`}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-200 p-1 flex-shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400">
                <Building2 className="w-6 h-6" aria-hidden="true" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-base leading-snug truncate" title={displayName}>
                {displayName}
              </h3>
              {category && (
                <span className="inline-block text-xs text-gray-500 font-medium truncate mt-0.5">
                  {category}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
              is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Individual Business Stats Pill Row */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 py-2 px-2.5 bg-gray-50/80 rounded-lg border border-gray-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">
              Visits
            </span>
            <span className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1 mt-0.5">
              <Eye className="w-3 h-3 text-purple-500" />
              {stats.pageVisits}
            </span>
          </div>

          <div className="border-x border-gray-200">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">
              Google Clicks
            </span>
            <span className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1 mt-0.5">
              <ExternalLink className="w-3 h-3 text-blue-500" />
              {stats.googleClicks}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">
              Click Rate
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {stats.conversionRate}
            </span>
          </div>
        </div>

        {/* Unique ReviewGen Business URL Box + Copy URL Button */}
        <div className="mt-3.5 bg-gray-50 border border-gray-200/90 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium text-gray-700">Unique Business URL</span>
            <a
              href={businessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-[11px]"
              title="Open customer review page"
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex-1 min-w-0 bg-white border border-gray-200 rounded px-2.5 py-1.5 font-mono text-xs text-gray-800 truncate select-all"
              title={businessUrl}
            >
              {businessUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 shadow-2xs'
              }`}
              title="Copy URL to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit?.(business)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Edit configuration"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleActive?.(business)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title={is_active ? 'Deactivate business' : 'Activate business'}
          >
            {is_active ? (
              <ToggleRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-xs text-gray-500">{is_active ? 'Disable' : 'Enable'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete?.(business)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete business"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
