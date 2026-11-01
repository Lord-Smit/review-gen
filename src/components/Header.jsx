import businessConfig from '../config/business';

export default function Header() {
  return (
    <header className="w-full py-5 px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <img
            src={businessConfig.BUSINESS_LOGO}
            alt={`${businessConfig.BUSINESS_NAME} logo`}
            className="h-12 w-12 rounded-xl object-cover shadow-sm"
          />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {businessConfig.BUSINESS_NAME}
          </h1>
        </div>
        {businessConfig.BUSINESS_TAGLINE && (
          <p className="text-sm text-gray-500 text-center">
            {businessConfig.BUSINESS_TAGLINE}
          </p>
        )}
      </div>
    </header>
  );
}
