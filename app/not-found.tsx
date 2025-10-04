import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo o Icono */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>

        {/* Descripción */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        {/* Ilustración simple */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Ir al Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Ir al Inicio
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-sm text-gray-500">
          <p>¿Necesitas ayuda? Contacta a soporte en</p>
          <a
            href="mailto:soporte@comodinia.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            soporte@comodinia.com
          </a>
        </div>
      </div>
    </div>
  );
}
