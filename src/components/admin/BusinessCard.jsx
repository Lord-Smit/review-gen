import { useEffect, useState } from 'react';
import {
  Building2,
  Pencil,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  TrendingUp,
  Utensils,
  Car,
  Bike,
} from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import { getBusinessStats } from '../../lib/analytics';
import { getBusinessUrl } from '../../config/app';
import { isSafeImageUrl } from '../../lib/validation';

function getIndustryBadge(industryKey, category) {
  const key = industryKey || (category ? category.toLowerCase() : 'generic');
  if (key.includes('restaurant') || key.includes('food') || key.includes('dining')) {
    return {
      label: 'Restaurant',
      icon: Utensils,
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
    };
  }
  if (key.includes('bike') || key.includes('two-wheeler')) {
    return {
      label: 'Bike Showroom',
      icon: Bike,
      className: 'bg-amber-50 text-amber-700 border-amber-200/80',
    };
  }
  if (key.includes('car') || key.includes('auto')) {
    return {
      label: 'Car Showroom',
      icon: Car,
      className: 'bg-blue-50 text-blue-700 border-blue-200/80',
    };
  }
  return {
    label: category || 'General',
    icon: Building2,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

export default function BusinessCard({ business, onEdit, onToggleActive, onDelete }) {
  const {
    id,
    name,
    business_name,
    slug,
    logo_url,
    category,
    industry_key,
    primary_color,
    is_active,
  } = business;

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

  const badge = getIndustryBadge(industry_key, category);
  const BadgeIcon = badge.icon;
  const brandColor = primary_color || '#2563EB';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
      {/* Brand accent top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-1.5 transition-opacity opacity-90 group-hover:opacity-100"
        style={{ backgroundColor: brandColor }}
      />

      <div className="space-y-4">
        {/* Header: Logo, Name, Category & Status */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            {logo_url && !logoFailed && isSafeImageUrl(logo_url) ? (
              <img
                src={logo_url}
                alt={`${displayName} logo`}
                className="h-12 w-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-base shadow-xs"
                style={{ backgroundColor: brandColor }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3
                className="font-bold text-slate-900 text-base leading-snug truncate"
                title={displayName}
              >
                {displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${badge.className}`}
                >
                  <BadgeIcon className="h-2.5 w-2.5" />
                  {badge.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  /{slug}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${
              is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                is_active ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Analytics Mini Strip */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/90 rounded-xl border border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Visits
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
              <Eye className="w-3 h-3 text-purple-500" />
              {stats.pageVisits}
            </span>
          </div>

          <div className="border-x border-slate-200/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Google Clicks
            </span>
            <span className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1 mt-0.5">
              <ExternalLink className="w-3 h-3 text-blue-500" />
              {stats.googleClicks}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Rate
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {stats.conversionRate}
            </span>
          </div>
        </div>

        {/* Customer ReviewGen URL Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
              Customer Review URL
            </span>
            <a
              href={businessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px] transition-colors"
              title="Open public review page"
            >
              Open Page <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-700 truncate select-all shadow-2xs"
              title={businessUrl}
            >
              {businessUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
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
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(business)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleActive?.(business)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              is_active
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>{is_active ? 'Pause' : 'Activate'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete?.(business)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Delete business"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
