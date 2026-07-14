import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Mejía Travel',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-slate max-w-2xl mx-auto py-8 px-4">
      <h1>Política de Privacidad</h1>
      <p className="text-sm text-slate-500">Última actualización: 14 de julio de 2026</p>

      <h2>1. Información que recopilamos</h2>
      <p>
        <strong>Mejía Travel</strong> (en adelante &quot;la App&quot;), operada por Chaski Bots Lab,
        recopila la siguiente información cuando usas nuestros servicios:
      </p>
      <ul>
        <li><strong>Datos de cuenta:</strong> correo electrónico y contraseña cifrada al registrarte.</li>
        <li><strong>Perfil:</strong> nombre, foto de perfil y número de teléfono (opcional) que tú proporcionas.</li>
        <li><strong>Ubicación:</strong> coordenadas GPS solo cuando usas funciones del mapa o publicas un artículo con ubicación. Nunca rastreamos tu ubicación en segundo plano.</li>
        <li><strong>Fotos:</strong> imágenes que subes voluntariamente para publicaciones en el mercado o eventos.</li>
        <li><strong>Datos de uso:</strong> páginas visitadas, tiempo de uso y errores técnicos para mejorar la experiencia.</li>
      </ul>

      <h2>2. Cómo usamos tu información</h2>
      <ul>
        <li>Autenticar tu identidad y gestionar tu cuenta.</li>
        <li>Mostrar negocios, eventos y artículos del mercado relevantes.</li>
        <li>Facilitar contacto entre compradores y vendedores (teléfono/WhatsApp que publicas).</li>
        <li>Mejorar y personalizar la experiencia de la App.</li>
        <li>Enviar notificaciones relacionadas con tu cuenta (recuperación de contraseña, etc.).</li>
      </ul>

      <h2>3. Compartición de datos</h2>
      <p>
        <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines
        publicitarios. Solo compartimos datos en los siguientes casos:
      </p>
      <ul>
        <li>Con proveedores de infraestructura (Supabase para base de datos, Railway para hosting) bajo contratos de confidencialidad.</li>
        <li>Cuando la ley lo requiera (orden judicial, requerimiento legal).</li>
        <li>Información que tú decides hacer pública (publicaciones del mercado, reseñas).</li>
      </ul>

      <h2>4. Almacenamiento y seguridad</h2>
      <p>
        Tus datos se almacenan en servidores seguros con cifrado en tránsito (HTTPS/TLS) y en reposo.
        Las contraseñas se almacenan hasheadas y nunca en texto plano. Implementamos Row Level Security
        para que cada usuario solo pueda acceder a sus propios datos.
      </p>

      <h2>5. Tus derechos</h2>
      <p>Puedes en cualquier momento:</p>
      <ul>
        <li>Acceder y descargar tus datos personales.</li>
        <li>Corregir información incorrecta en tu perfil.</li>
        <li>Eliminar tu cuenta y todos los datos asociados.</li>
        <li>Retirar tu consentimiento para el uso de ubicación.</li>
      </ul>
      <p>
        Para ejercer estos derechos, escríbenos a{' '}
        <a href="mailto:contacto@chaskibots.com">contacto@chaskibots.com</a>.
      </p>

      <h2>6. Retención de datos</h2>
      <p>
        Conservamos tu información mientras mantengas una cuenta activa. Las publicaciones del mercado
        se eliminan automáticamente después de 30 días de expiración. Si eliminas tu cuenta,
        borraremos tus datos personales en un plazo máximo de 30 días.
      </p>

      <h2>7. Menores de edad</h2>
      <p>
        La App no está dirigida a menores de 13 años. No recopilamos intencionalmente información
        de menores. Si detectamos una cuenta de un menor, la eliminaremos.
      </p>

      <h2>8. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos
        mediante un aviso en la App. El uso continuado después de los cambios constituye aceptación.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política de privacidad:
      </p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:contacto@chaskibots.com">contacto@chaskibots.com</a></li>
        <li><strong>Empresa:</strong> Chaski Bots Lab</li>
        <li><strong>Ubicación:</strong> Cantón Mejía, Pichincha, Ecuador</li>
      </ul>
    </div>
  );
}
