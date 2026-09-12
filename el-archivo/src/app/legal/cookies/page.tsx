import type { Metadata } from "next";
import Link from "next/link";
import { OWNER } from "@/lib/config";
import { CONSENT_MAX_AGE_DAYS } from "@/lib/consent";
import { Fill, LegalPage } from "@/components/legal";
import { CookiePreferencesButton } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies usa este sitio, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o cambiar de opinión en cualquier momento.",
};

const TOC: [string, string][] = [
  ["que-son", "1. Qué son las cookies"],
  ["base", "2. Por qué se te pregunta"],
  ["tipos", "3. Tipos de cookies que usamos"],
  ["tabla", "4. Detalle de cookies"],
  ["gestionar", "5. Cómo aceptar, rechazar o cambiar"],
  ["navegador", "6. Cómo borrarlas desde tu navegador"],
  ["terceros", "7. Terceros"],
  ["consecuencias", "8. Qué pasa si las rechazas"],
  ["cambios", "9. Actualizaciones"],
];

export default function Cookies() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de cookies"
      lede="Qué se guarda en tu navegador, con qué finalidad, cuánto dura y cómo cambiarlo cuando quieras. Redactada conforme al artículo 22.2 de la LSSI-CE y a la Guía sobre el uso de las cookies de la Agencia Española de Protección de Datos."
      toc={TOC}
    >
      <h2 id="que-son">1. Qué son las cookies</h2>
      <p>
        Una cookie es un pequeño archivo que un sitio guarda en tu navegador para recordar algo entre
        páginas o entre visitas. En esta política se llama «cookies», por comodidad, a todas las
        técnicas de almacenamiento y recuperación de datos en tu dispositivo, incluidas las que este
        sitio usa realmente: <code>localStorage</code> y una cookie propia de consentimiento.
      </p>

      <h2 id="base">2. Por qué se te pregunta</h2>
      <p>
        El artículo 22.2 de la LSSI-CE exige tu <strong>consentimiento informado</strong> para
        cualquier almacenamiento que no sea estrictamente necesario para prestar el servicio. Por
        eso:
      </p>
      <ul>
        <li>Nada que no sea necesario se activa antes de que decidas.</li>
        <li>
          Rechazar cuesta exactamente lo mismo que aceptar: un clic, en un botón del mismo tamaño.
        </li>
        <li>Seguir navegando, hacer scroll o cerrar el aviso NO equivale a aceptar.</li>
        <li>
          Tu decisión se guarda {CONSENT_MAX_AGE_DAYS} días y después se vuelve a preguntar. También
          se vuelve a preguntar si cambian las finalidades.
        </li>
      </ul>

      <h2 id="tipos">3. Tipos de cookies que usamos</h2>
      <h3>Según quién las gestiona</h3>
      <ul>
        <li>
          <strong>Propias:</strong> las gestiona este sitio. Son las únicas que se activan sin
          consentimiento, y solo las estrictamente necesarias.
        </li>
        <li>
          <strong>De terceros:</strong> las gestionan proveedores externos (analítica, publicidad).
          Requieren consentimiento previo y expreso.
        </li>
      </ul>
      <h3>Según su finalidad</h3>
      <ul>
        <li>
          <strong>Técnicas o necesarias:</strong> permiten navegar, mantener la seguridad y recordar
          tu decisión sobre cookies. Sin ellas el sitio no puede funcionar.
        </li>
        <li>
          <strong>De preferencias o personalización:</strong> recuerdan cómo quieres ver el sitio
          (tema claro u oscuro, filtros, tu apodo).
        </li>
        <li>
          <strong>De análisis o medición:</strong> permiten saber, de forma agregada, qué secciones
          se leen.
        </li>
        <li>
          <strong>De publicidad:</strong> permiten mostrar anuncios y medir su rendimiento.
        </li>
      </ul>

      <h2 id="tabla">4. Detalle de cookies</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>ea_consent</code>
            </td>
            <td>Propia · necesaria</td>
            <td>Guarda qué categorías has aceptado o rechazado, y la versión del texto.</td>
            <td>{CONSENT_MAX_AGE_DAYS} días</td>
          </tr>
          <tr>
            <td>
              <code>el-archivo:consent</code>
            </td>
            <td>Propia · necesaria (localStorage)</td>
            <td>Misma finalidad, con la fecha exacta de la decisión como prueba del consentimiento.</td>
            <td>Hasta que la borres</td>
          </tr>
          <tr>
            <td>
              <code>el-archivo:theme</code>
            </td>
            <td>Propia · preferencias (localStorage)</td>
            <td>Recuerda si has elegido el tema claro o el oscuro.</td>
            <td>Hasta que la borres</td>
          </tr>
          <tr>
            <td>
              <code>el-archivo:v1</code>
            </td>
            <td>Propia · preferencias (localStorage)</td>
            <td>
              Guarda en tu navegador el apodo y las aportaciones, votos y comentarios que envías en
              este sitio.
            </td>
            <td>Hasta que la borres</td>
          </tr>
          <tr>
            <td>
              <Fill>[COOKIES DEL PROVEEDOR DE ANALÍTICA]</Fill>
            </td>
            <td>Terceros · análisis</td>
            <td>Medición agregada de uso. Solo se instalan si aceptas esta categoría.</td>
            <td>
              <Fill>[SEGÚN PROVEEDOR]</Fill>
            </td>
          </tr>
          <tr>
            <td>
              <Fill>[COOKIES DE LA RED PUBLICITARIA]</Fill>
            </td>
            <td>Terceros · publicidad</td>
            <td>Servir anuncios y medir su rendimiento. Solo si aceptas esta categoría.</td>
            <td>
              <Fill>[SEGÚN PROVEEDOR]</Fill>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Las dos últimas filas hay que completarlas con los datos exactos del proveedor que contrates,
        incluyendo el enlace a su propia política. Publicar una tabla incompleta es uno de los
        incumplimientos que la AEPD sanciona con más frecuencia.
      </p>

      <h2 id="gestionar">5. Cómo aceptar, rechazar o cambiar</h2>
      <p>
        En tu primera visita aparece un aviso con tres opciones al mismo nivel: <strong>Aceptar
        todo</strong>, <strong>Rechazar</strong> y <strong>Configurar</strong>. Puedes cambiar de
        opinión cuando quieras, desde aquí mismo o desde el enlace «Cookies» del pie de página:
      </p>
      <p>
        <CookiePreferencesButton className="btn" />
      </p>

      <h2 id="navegador">6. Cómo borrarlas desde tu navegador</h2>
      <p>
        Además, puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en
        cuenta que si las borras todas, también borrarás el registro de tu decisión y se te volverá a
        preguntar.
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/Borrar%20cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/es-es/HT201265" target="_blank" rel="noopener noreferrer">
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/es-es/microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2 id="terceros">7. Terceros</h2>
      <p>
        Este sitio no incrusta contenido de terceros (vídeos, mapas, redes sociales) que instale
        cookies sin tu permiso: los materiales externos se <strong>enlazan</strong>, no se
        incrustan. Si en el futuro se incrusta alguno, quedará bloqueado hasta que aceptes la
        categoría correspondiente, y esta tabla se actualizará.
      </p>

      <h2 id="consecuencias">8. Qué pasa si las rechazas</h2>
      <p>
        El sitio funciona igual: puedes leer todo el archivo, buscar, filtrar y consultar las
        fuentes. Solo perderás comodidades: no se recordará el tema que elegiste ni tus filtros
        entre visitas, y el espacio publicitario aparecerá vacío. No se te penaliza por rechazar, ni
        se te vuelve a preguntar de forma insistente.
      </p>

      <h2 id="cambios">9. Actualizaciones</h2>
      <p>
        Esta política se revisa cuando cambian las cookies utilizadas o la normativa aplicable.
        Cualquier duda: <Fill>{OWNER.email}</Fill>. Más información sobre el tratamiento de tus
        datos en la <Link href="/legal/privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
