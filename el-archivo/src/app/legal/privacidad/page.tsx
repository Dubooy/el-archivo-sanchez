import type { Metadata } from "next";
import Link from "next/link";
import { OWNER } from "@/lib/config";
import { Fill, LegalPage, OwnerBlock } from "@/components/legal";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos se tratan, con qué base jurídica, cuánto se conservan, quién los recibe y cómo ejercer los derechos de protección de datos.",
};

const TOC: [string, string][] = [
  ["responsable", "1. Responsable del tratamiento"],
  ["principios", "2. Principios que aplicamos"],
  ["datos", "3. Qué datos tratamos y de dónde salen"],
  ["finalidades", "4. Finalidades y bases jurídicas"],
  ["publicas", "5. Datos de personas con proyección pública"],
  ["plazos", "6. Cuánto tiempo se conservan"],
  ["destinatarios", "7. Destinatarios y encargados"],
  ["transferencias", "8. Transferencias internacionales"],
  ["derechos", "9. Tus derechos"],
  ["menores", "10. Menores de edad"],
  ["seguridad", "11. Medidas de seguridad"],
  ["brechas", "12. Brechas de seguridad"],
  ["cambios", "13. Cambios en esta política"],
];

export default function Privacidad() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de privacidad"
      lede="Qué datos personales trata este sitio, para qué, con qué base jurídica, cuánto tiempo y qué puedes hacer al respecto. Redactada conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD)."
      toc={TOC}
    >
      <h2 id="responsable">1. Responsable del tratamiento</h2>
      <OwnerBlock />
      <p>
        {OWNER.dpo ? (
          <>
            Delegado de protección de datos: <Fill>{OWNER.dpo}</Fill>.
          </>
        ) : (
          <>
            Este sitio <strong>no está obligado</strong> a designar delegado de protección de datos
            conforme al artículo 37 del RGPD. Si tu tratamiento cambia de escala o incluye
            observación sistemática a gran escala, revisa esa obligación antes de publicar.
          </>
        )}{" "}
        Para cualquier cuestión sobre tus datos: <Fill>{OWNER.email}</Fill>.
      </p>

      <h2 id="principios">2. Principios que aplicamos</h2>
      <ul>
        <li>
          <strong>Minimización.</strong> Solo se pide lo imprescindible. Para participar no hace
          falta nombre real, teléfono ni dirección.
        </li>
        <li>
          <strong>Nada oculto.</strong> No hay perfilado, ni decisiones automatizadas con efectos
          jurídicos, ni venta de datos a terceros. Nunca.
        </li>
        <li>
          <strong>Consentimiento real.</strong> Ninguna cookie no necesaria se activa antes de que
          lo autorices, y retirarlo cuesta lo mismo que darlo.
        </li>
        <li>
          <strong>Datos sensibles fuera.</strong> No se recogen categorías especiales del artículo 9
          del RGPD (salud, ideología, afiliación sindical, origen racial, orientación sexual). Si
          aparecen en una aportación, se eliminan en moderación.
        </li>
      </ul>

      <h2 id="datos">3. Qué datos tratamos y de dónde salen</h2>
      <table>
        <thead>
          <tr>
            <th>Origen</th>
            <th>Datos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Cuenta de usuario</th>
            <td>
              Tu dirección de correo (para identificarte y avisarte de lo que pasa con lo que
              envías) y un apodo, que es lo único que se muestra públicamente. Si entras con Google
              o GitHub, recibimos tu correo y un identificador del proveedor:{" "}
              <strong>el nombre y la foto se descartan en el momento de crear la cuenta</strong> y no
              se guardan. No usamos contraseñas, así que no hay ninguna que podamos perder.
            </td>
          </tr>
          <tr>
            <th>Control de envíos (antispam)</th>
            <td>
              Para limitar cuántos envíos admite una misma procedencia por minuto guardamos un{" "}
              <strong>resumen criptográfico de la dirección IP</strong> (SHA-256 con una sal
              secreta), nunca la dirección en claro. Ese resumen no permite reconstruir la IP y se
              borra automáticamente al vencer su ventana de control.
            </td>
          </tr>
          <tr>
            <th>Formulario de aportación</th>
            <td>
              Apodo o seudónimo elegido, contenido enviado, enlaces a las fuentes y, si lo
              proporcionas voluntariamente, un correo de contacto para responderte.
            </td>
          </tr>
          <tr>
            <th>Comentarios y votaciones</th>
            <td>Apodo, texto del comentario, postura elegida, fecha y hora.</td>
          </tr>
          <tr>
            <th>Correo de contacto</th>
            <td>
              Dirección de correo, contenido del mensaje y cualquier dato que decidas incluir en él.
            </td>
          </tr>
          <tr>
            <th>Registros del servidor</th>
            <td>
              Dirección IP, fecha y hora, página solicitada, agente de usuario y código de respuesta.
              Se generan de forma automática al servir la web.
            </td>
          </tr>
          <tr>
            <th>Cookies y almacenamiento local</th>
            <td>
              Tu decisión sobre cookies, el tema elegido y, si lo autorizas, identificadores de
              analítica o publicidad. Detalle en la{" "}
              <Link href="/legal/cookies">política de cookies</Link>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="finalidades">4. Finalidades y bases jurídicas</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base jurídica (art. 6.1 RGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Publicar y moderar aportaciones y comentarios</th>
            <td>
              Consentimiento del interesado, prestado al enviar el contenido (art. 6.1.a), y
              ejecución de la relación de uso del servicio (art. 6.1.b).
            </td>
          </tr>
          <tr>
            <th>Responder a consultas y solicitudes</th>
            <td>Consentimiento e interés legítimo en atender a quien nos escribe (art. 6.1.a y f).</td>
          </tr>
          <tr>
            <th>Seguridad del sitio, prevención de abuso y registro técnico</th>
            <td>
              Interés legítimo en mantener el servicio operativo y libre de ataques y spam (art.
              6.1.f).
            </td>
          </tr>
          <tr>
            <th>Analítica de uso agregada</th>
            <td>Consentimiento (art. 6.1.a). Sin él, no se activa.</td>
          </tr>
          <tr>
            <th>Publicidad y medición publicitaria</th>
            <td>Consentimiento (art. 6.1.a). Sin él, el espacio queda vacío.</td>
          </tr>
          <tr>
            <th>Cumplimiento de obligaciones legales y atención de requerimientos</th>
            <td>Obligación legal (art. 6.1.c).</td>
          </tr>
        </tbody>
      </table>
      <p>
        Cuando la base es el <strong>interés legítimo</strong>, se ha realizado la ponderación que
        exige el RGPD: el tratamiento se limita a lo necesario para que el sitio funcione con
        seguridad y no prevalece sobre tus derechos. Puedes oponerte en cualquier momento.
      </p>

      <h2 id="publicas">5. Datos de personas con proyección pública</h2>
      <p>
        Este sitio documenta la <strong>actividad pública</strong> de cargos políticos a partir de
        fuentes públicas. Ese tratamiento se ampara en el artículo 85 del RGPD y en el artículo 20
        de la Constitución Española, que protegen la libertad de información en asuntos de relevancia
        pública, y se sujeta a reglas estrictas:
      </p>
      <ul>
        <li>Solo se documenta lo relacionado con el ejercicio del cargo o con la actividad pública.</li>
        <li>
          No se publican datos privados: domicilio, teléfono, correo personal, datos de familiares,
          salud, situación patrimonial ajena a lo publicado oficialmente ni datos de menores.
        </li>
        <li>Cada registro enlaza a su fuente pública original y va fechado.</li>
        <li>
          Una acusación o una investigación no se presenta nunca como condena, y la existencia de un
          procedimiento no implica culpabilidad.
        </li>
        <li>
          Cualquier persona mencionada puede solicitar rectificación o supresión por el
          procedimiento del{" "}
          <Link href="/legal/aviso-legal#retirada">aviso legal</Link>, y se le responde de forma
          motivada.
        </li>
      </ul>

      <h2 id="plazos">6. Cuánto tiempo se conservan</h2>
      <table>
        <thead>
          <tr>
            <th>Dato</th>
            <th>Plazo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Aportaciones publicadas</th>
            <td>
              Mientras el archivo siga publicado, por su finalidad documental, o hasta que solicites
              la supresión de tus datos identificativos (el contenido documental puede permanecer
              disociado del apodo).
            </td>
          </tr>
          <tr>
            <th>Cuenta de usuario</th>
            <td>
              Mientras la cuenta exista. Al darla de baja se elimina el correo y se marca la cuenta
              como suprimida; lo que ya esté publicado puede permanecer disociado, porque forma
              parte del archivo y del historial de decisiones.
            </td>
          </tr>
          <tr>
            <th>Sesiones y enlaces de acceso</th>
            <td>
              El enlace mágico caduca a los 15 minutos y sirve una sola vez. La sesión caduca a los
              30 días o al cerrarla.
            </td>
          </tr>
          <tr>
            <th>Resúmenes de IP (antispam)</th>
            <td>
              Lo que dure su ventana de control —minutos u horas— y se borran automáticamente. No
              se conservan ni se usan para nada más.
            </td>
          </tr>
          <tr>
            <th>Aportaciones rechazadas</th>
            <td>12 meses desde la decisión, para poder justificarla, y después se eliminan.</td>
          </tr>
          <tr>
            <th>Correos de contacto</th>
            <td>12 meses desde la última comunicación.</td>
          </tr>
          <tr>
            <th>Registros del servidor</th>
            <td>Máximo 12 meses, salvo que sean necesarios para investigar un incidente.</td>
          </tr>
          <tr>
            <th>Registro del consentimiento de cookies</th>
            <td>6 meses, tras los cuales se vuelve a preguntar.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="destinatarios">7. Destinatarios y encargados</h2>
      <p>
        No se ceden datos a terceros salvo obligación legal. Sí intervienen proveedores que actúan
        como <strong>encargados del tratamiento</strong>, con contrato del artículo 28 del RGPD:
      </p>
      <ul>
        <li>
          Proveedor de alojamiento: <Fill>{OWNER.host}</Fill> (
          <Fill>{OWNER.hostPrivacy}</Fill>).
        </li>
        <li>Proveedor de correo electrónico, si se usa uno externo.</li>
        <li>Proveedor de analítica, solo si autorizas esa categoría de cookies.</li>
        <li>Red publicitaria, solo si autorizas esa categoría de cookies.</li>
      </ul>

      <h2 id="transferencias">8. Transferencias internacionales</h2>
      <p>
        Si algún proveedor trata datos fuera del Espacio Económico Europeo, la transferencia se
        ampara en una decisión de adecuación de la Comisión Europea o en cláusulas contractuales
        tipo, con las garantías adicionales que correspondan. Puedes solicitar copia de esas
        garantías escribiendo a <Fill>{OWNER.email}</Fill>.
      </p>

      <h2 id="derechos">9. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento los derechos de <strong>acceso, rectificación,
        supresión, oposición, limitación del tratamiento y portabilidad</strong>, así como{" "}
        <strong>retirar el consentimiento</strong> que hayas prestado, sin que ello afecte a la
        licitud del tratamiento previo.
      </p>
      <ul>
        <li>
          <strong>Cómo:</strong> escribiendo a <Fill>{OWNER.email}</Fill>, indicando qué derecho
          ejerces. Puede pedirse acreditación de identidad si hay dudas razonables sobre quién
          solicita.
        </li>
        <li>
          <strong>Plazo de respuesta:</strong> un mes, prorrogable a dos si la solicitud es compleja.
        </li>
        <li>
          <strong>Coste:</strong> gratuito, salvo solicitudes manifiestamente infundadas o excesivas.
        </li>
        <li>
          <strong>Cookies:</strong> tu decisión se cambia desde el botón «Cookies» del pie, en
          cualquier página.
        </li>
        <li>
          <strong>Reclamación:</strong> si consideras que no se han atendido tus derechos, puedes
          reclamar ante la Agencia Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            www.aepd.es
          </a>
          ), C/ Jorge Juan 6, 28001 Madrid.
        </li>
      </ul>

      <h2 id="menores">10. Menores de edad</h2>
      <p>
        Este sitio no está dirigido a menores de 14 años y no solicita datos de menores. Si detectas
        que un menor ha enviado datos personales, escribe a <Fill>{OWNER.email}</Fill> y se
        eliminarán.
      </p>

      <h2 id="seguridad">11. Medidas de seguridad</h2>
      <ul>
        <li>Cifrado en tránsito mediante HTTPS con HSTS en todo el sitio.</li>
        <li>
          Cabeceras de seguridad aplicadas a nivel de servidor: política de seguridad de contenido
          (CSP), bloqueo de incrustación en marcos, control de referente y de permisos.
        </li>
        <li>Premoderación de todo el contenido aportado por usuarios.</li>
        <li>Protección antispam en formularios sin recurrir a rastreo del usuario.</li>
        <li>Acceso a la administración limitado y registrado.</li>
        <li>Copias de seguridad periódicas y revisión de dependencias.</li>
      </ul>

      <h2 id="brechas">12. Brechas de seguridad</h2>
      <p>
        Si se produce una violación de seguridad de los datos personales que suponga un riesgo para
        tus derechos, se notificará a la Agencia Española de Protección de Datos en un plazo de{" "}
        <strong>72 horas</strong> desde que se tenga constancia, y se comunicará a las personas
        afectadas sin dilación indebida cuando el riesgo sea alto, conforme a los artículos 33 y 34
        del RGPD.
      </p>

      <h2 id="cambios">13. Cambios en esta política</h2>
      <p>
        Esta política puede actualizarse por cambios normativos o de funcionamiento del sitio. La
        versión vigente es siempre la publicada en esta página, con su fecha de revisión. Si el
        cambio afecta a las finalidades de las cookies, se volverá a solicitar tu consentimiento.
      </p>
    </LegalPage>
  );
}
