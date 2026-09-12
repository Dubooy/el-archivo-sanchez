import type { Metadata } from "next";
import Link from "next/link";
import { OWNER, SITE } from "@/lib/config";
import { Fill, LegalPage, OwnerBlock } from "@/components/legal";

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Titular del sitio, condiciones de uso, propiedad intelectual, responsabilidad y procedimiento de retirada de contenidos.",
};

const TOC: [string, string][] = [
  ["titular", "1. Datos del titular"],
  ["objeto", "2. Objeto y aceptación"],
  ["uso", "3. Condiciones de uso"],
  ["contenidos", "4. Contenidos aportados por usuarios"],
  ["propiedad", "5. Propiedad intelectual e industrial"],
  ["citas", "6. Citas, fuentes y derecho de cita"],
  ["enlaces", "7. Enlaces a terceros"],
  ["responsabilidad", "8. Exclusión de responsabilidad"],
  ["retirada", "9. Retirada de contenidos y derecho de rectificación"],
  ["disponibilidad", "10. Disponibilidad del servicio"],
  ["ley", "11. Legislación aplicable y jurisdicción"],
];

export default function AvisoLegal() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Aviso legal"
      lede="Quién está detrás de este sitio, con qué condiciones se puede usar y qué se puede hacer con lo que aquí se publica. Redactado conforme a la Ley 34/2002 (LSSI-CE) y al Real Decreto Legislativo 1/1996 (Ley de Propiedad Intelectual)."
      toc={TOC}
    >
      <h2 id="titular">1. Datos del titular</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la
        información y de comercio electrónico (LSSI-CE), se hacen constar los siguientes datos:
      </p>
      <OwnerBlock />
      <p>
        <strong>{SITE.independence}</strong> No se utiliza el emblema, el nombre ni la identidad
        gráfica oficial de ninguna formación política, y el uso del color rojo es una decisión
        editorial propia de esta plataforma.
      </p>

      <h2 id="objeto">2. Objeto y aceptación</h2>
      <p>
        Este sitio es un <strong>archivo documental de acceso público</strong> que recopila,
        organiza y contrasta declaraciones, promesas, contradicciones y fuentes relativas a la
        actividad pública de un cargo político, y permite a los lectores debatir y aportar material.
      </p>
      <p>
        Navegar por el sitio atribuye la condición de usuario e implica la aceptación plena de este
        aviso legal, de la{" "}
        <Link href="/legal/privacidad">política de privacidad</Link> y de la{" "}
        <Link href="/legal/cookies">política de cookies</Link> en la versión publicada en cada
        momento. Si no estás de acuerdo con alguna de sus cláusulas, no utilices el sitio.
      </p>

      <h2 id="uso">3. Condiciones de uso</h2>
      <p>El usuario se compromete a:</p>
      <ul>
        <li>Hacer un uso lícito del sitio y no emplearlo con fines contrarios a la ley.</li>
        <li>
          No introducir contenidos injuriosos, calumniosos, discriminatorios, que inciten al odio o
          a la violencia, ni que vulneren derechos de terceros.
        </li>
        <li>
          No atribuir a ninguna persona la comisión de un delito, ni presentar una investigación o
          una acusación como si fuera una condena.
        </li>
        <li>
          No difundir datos personales de terceros (domicilios, teléfonos, correos, matrículas,
          datos de familiares) ni información privada ajena al ejercicio de un cargo público.
        </li>
        <li>
          No realizar acciones que perjudiquen el funcionamiento del sitio: extracción masiva
          automatizada, ingeniería inversa, introducción de código malicioso o intentos de acceso no
          autorizado.
        </li>
      </ul>

      <h2 id="contenidos">4. Contenidos aportados por usuarios</h2>
      <p>
        El sitio permite enviar material (enlaces, documentos, declaraciones, datos). Sobre esas
        aportaciones rige lo siguiente:
      </p>
      <ol>
        <li>
          <strong>Premoderación.</strong> Nada aportado por un usuario se publica automáticamente.
          Todo pasa por una cola de revisión y solo se publica si se acepta.
        </li>
        <li>
          <strong>Responsabilidad del aportante.</strong> Quien envía material declara que tiene
          derecho a hacerlo y que el contenido no vulnera derechos de terceros.
        </li>
        <li>
          <strong>Licencia de uso.</strong> Al enviar material, el usuario autoriza al titular a
          reproducirlo, almacenarlo y comunicarlo públicamente dentro del sitio con la finalidad
          documental descrita, sin exclusividad y sin contraprestación económica. El usuario conserva
          la titularidad de sus derechos.
        </li>
        <li>
          <strong>Opinión y hecho, separados.</strong> Las conclusiones personales del aportante se
          publican, en su caso, etiquetadas como opinión, y nunca se incorporan al archivo como
          hecho documentado.
        </li>
        <li>
          <strong>Prestador de servicios de intermediación.</strong> Respecto de los contenidos
          alojados a instancia de los usuarios, el titular actúa conforme a los artículos 13 a 17 de
          la LSSI-CE: no tiene obligación general de supervisión, y retira o bloquea el contenido en
          cuanto tiene conocimiento efectivo de su ilicitud.
        </li>
      </ol>

      <h2 id="propiedad">5. Propiedad intelectual e industrial</h2>
      <p>
        El diseño, la estructura de navegación, el código fuente, los textos editoriales, la
        iconografía y las bases de datos del sitio son titularidad de{" "}
        <Fill>{OWNER.legalName}</Fill> o de terceros que han autorizado su uso, y están protegidos
        por el Real Decreto Legislativo 1/1996 (Ley de Propiedad Intelectual).
      </p>
      <p>
        Se autoriza la reproducción parcial de los contenidos editoriales <strong>citando la
        fuente y enlazando al original</strong>. Queda prohibida su explotación comercial, su
        transformación y la extracción o reutilización sustancial de la base de datos sin
        autorización expresa y por escrito.
      </p>
      <p>
        Las marcas, nombres comerciales y logotipos de terceros que puedan aparecer pertenecen a sus
        titulares. Su mención no implica patrocinio, afiliación ni recomendación.
      </p>

      <h2 id="citas">6. Citas, fuentes y derecho de cita</h2>
      <p>
        Este sitio reproduce fragmentos de declaraciones, noticias y documentos públicos amparándose
        en el <strong>derecho de cita</strong> del artículo 32.1 de la Ley de Propiedad Intelectual,
        con finalidad de análisis, comentario o juicio crítico, en la extensión justificada por esa
        finalidad y citando siempre autor, medio y fecha, con enlace a la publicación original.
      </p>
      <p>
        No se alojan copias completas de obras de terceros: se enlaza al original. Si eres titular de
        derechos y consideras que un contenido excede el derecho de cita, escribe a{" "}
        <Fill>{OWNER.email}</Fill> y se revisará con prioridad.
      </p>

      <h2 id="enlaces">7. Enlaces a terceros</h2>
      <p>
        El sitio contiene enlaces a páginas de terceros (medios, boletines oficiales, repositorios
        documentales). Esos enlaces se ofrecen únicamente como referencia de la fuente. El titular
        no controla ni asume responsabilidad sobre sus contenidos, su disponibilidad ni sus
        políticas de privacidad. La inclusión de un enlace no implica aprobación de su contenido.
      </p>

      <h2 id="responsabilidad">8. Exclusión de responsabilidad</h2>
      <p>
        Las conclusiones publicadas son <strong>valoraciones editoriales fechadas</strong>, basadas
        en las fuentes citadas en cada ficha, y pueden revisarse o corregirse cuando aparece nueva
        evidencia. No son verdades absolutas ni resoluciones de ningún tipo.
      </p>
      <p>
        <strong>{SITE.judicialNotice}</strong>
      </p>
      <p>
        La votación de la comunidad mide percepción de los lectores y no constituye verificación de
        hechos. El titular no responde de las opiniones vertidas por los usuarios, que son
        responsabilidad exclusiva de quien las emite.
      </p>

      <h2 id="retirada">9. Retirada de contenidos y derecho de rectificación</h2>
      <p>Existen dos vías, y ambas se atienden:</p>
      <ol>
        <li>
          <strong>Corrección documental.</strong> Cualquiera puede señalar un error aportando la
          fuente que lo desmonta, desde la propia ficha o desde{" "}
          <Link href="/metodologia#correcciones">Metodología</Link>. Si el error se confirma, la
          ficha se corrige, se anota qué cambió y por qué, y la corrección queda visible.
        </li>
        <li>
          <strong>Requerimiento formal.</strong> Escribiendo a <Fill>{OWNER.email}</Fill> con
          identificación del solicitante, URL exacta del contenido, motivo y, si procede, la
          documentación que lo acredite. Se acusará recibo y se resolverá de forma motivada.
        </li>
      </ol>
      <p>
        Queda a salvo el derecho de rectificación de la Ley Orgánica 2/1984 respecto de información
        de hechos que se considere inexacta y cuya difusión pueda causar perjuicio.
      </p>

      <h2 id="disponibilidad">10. Disponibilidad del servicio</h2>
      <p>
        El titular no garantiza la disponibilidad ininterrumpida del sitio ni la ausencia de errores,
        y se reserva el derecho a modificar, suspender o retirar cualquier contenido o sección, así
        como a actualizar este aviso legal. Los cambios entran en vigor desde su publicación.
      </p>

      <h2 id="ley">11. Legislación aplicable y jurisdicción</h2>
      <p>
        Esta relación se rige por la <strong>legislación española</strong>. Para cualquier
        controversia, las partes se someten a los juzgados y tribunales del domicilio del titular,
        salvo que la normativa de consumidores atribuya la competencia al domicilio del usuario, en
        cuyo caso prevalecerá esta última.
      </p>
    </LegalPage>
  );
}
