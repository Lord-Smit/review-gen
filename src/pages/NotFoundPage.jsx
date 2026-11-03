import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFoundPage() {
  useDocumentMeta({
    title: 'Page not found — ReviewGen',
    description: 'The business you are looking for does not exist or is no longer active.',
    noIndex: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-extrabold text-gray-300 tracking-tight sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-base text-gray-500">
          The business you&apos;re looking for doesn&apos;t exist or is no longer active.
        </p>
      </div>
    </div>
  );
}
