import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { isSafeImageUrl } from '../lib/validation';

export default function Header() {
  const business = useBusiness();
  const [logoFailed, setLogoFailed] = useState(false);

  const name = business?.name || business?.business_name || '';
  const logoUrl = isSafeImageUrl(business?.logo_url) ? business.logo_url : '/logo.svg';
  const showLogo = Boolean(logoUrl) && !logoFailed;

  return (
    <header className="w-full px-4 py-5">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {showLogo ? (
            <img
              src={logoUrl}
              alt={name ? `${name} logo` : 'Business logo'}
              className="h-12 w-12 rounded-xl object-cover shadow-sm"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
          <span className="text-xl font-bold tracking-tight text-gray-900">{name}</span>
        </div>
      </div>
    </header>
  );
}
