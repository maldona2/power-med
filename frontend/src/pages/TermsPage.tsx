import {
  LegalLayout,
  LegalSection,
  LegalList,
  LegalDefinitions,
} from '@/components/landing/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout title="Términos y Condiciones" lastUpdated="2025-12-11">
      <LegalSection id="terminos-generales" title="Términos Generales">
        <p>
          Al acceder y utilizar Atriax, usted confirma que está de acuerdo y se
          obliga por los términos de servicio contenidos en el presente
          documento. Estos términos se aplican a todo el sitio web y a cualquier
          comunicación entre usted y Atriax.
        </p>
        <p>
          Bajo ninguna circunstancia el equipo de Atriax será responsable por
          cualquier daño directo, indirecto, especial, incidental o consecuente,
          incluyendo pero no limitado a pérdida de datos o ganancias, que surja
          del uso o la incapacidad de usar la plataforma, incluso si Atriax o un
          representante autorizado ha sido advertido de la posibilidad de tales
          daños.
        </p>
        <p>
          Si su uso de los materiales de este sitio resulta en la necesidad de
          servicio, reparación o corrección de equipo o datos, usted asume
          cualquier costo de ello. Atriax se reserva el derecho de cambiar
          precios y revisar su política de uso de recursos en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection id="licencia" title="Licencia">
        <p>
          Atriax le otorga una licencia revocable, no exclusiva, no transferible
          y limitada para acceder y usar la plataforma estrictamente de acuerdo
          con los términos de este Acuerdo.
        </p>
        <p>
          Estos Términos constituyen un contrato entre usted y Atriax. Si viola
          cualquiera de estos términos, nos reservamos el derecho de cancelar su
          cuenta o bloquear el acceso sin previo aviso.
        </p>
      </LegalSection>

      <LegalSection id="definiciones" title="Definiciones y Términos Clave">
        <LegalDefinitions
          entries={[
            {
              term: 'Cookie',
              definition:
                'Pequeña cantidad de datos almacenada por su navegador web.',
            },
            {
              term: 'Compañía',
              definition:
                'Atriax, plataforma de gestión para profesionales de la salud.',
            },
            {
              term: 'País',
              definition: 'Argentina.',
            },
            {
              term: 'Dispositivo',
              definition: 'Cualquier equipo con acceso a internet.',
            },
            {
              term: 'Servicio',
              definition: 'La plataforma y servicios ofrecidos por Atriax.',
            },
            {
              term: 'Servicio de terceros',
              definition:
                'Servicios o plataformas externas vinculadas a Atriax.',
            },
            {
              term: 'Sitio web',
              definition: 'La plataforma web de Atriax.',
            },
            {
              term: 'Usted',
              definition:
                'El usuario registrado que accede y utiliza la plataforma Atriax.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="restricciones" title="Restricciones">
        <p>Como usuario de Atriax, usted acepta no:</p>
        <LegalList
          items={[
            'Vender, alquilar o sublicenciar el acceso a la plataforma.',
            'Modificar, realizar ingeniería inversa o descompilar cualquier parte del servicio.',
            'Eliminar avisos legales, marcas o indicaciones de propiedad intelectual.',
            'Usar la plataforma para actividades ilegales o que infrinjan derechos de terceros.',
          ]}
        />
      </LegalSection>

      <LegalSection
        id="reembolsos"
        title="Política de Devoluciones y Reembolsos"
      >
        <p>
          Si no está satisfecho con el servicio de Atriax, le invitamos a
          contactarnos. Analizaremos su caso de manera individual y buscaremos
          la mejor solución posible, que puede incluir un ajuste de plan,
          extensión de período de prueba o reembolso según corresponda.
        </p>
      </LegalSection>

      <LegalSection id="sugerencias" title="Sus Sugerencias">
        <p>
          Las sugerencias, ideas o comentarios que nos envíe sobre Atriax pasan
          a ser propiedad de Atriax y podrán ser utilizados para mejorar la
          plataforma sin obligación de compensación alguna hacia usted.
        </p>
      </LegalSection>

      <LegalSection id="consentimiento" title="Su Consentimiento">
        <p>
          Al utilizar Atriax, usted declara haber leído, comprendido y aceptado
          estos Términos y Condiciones en su totalidad.
        </p>
      </LegalSection>

      <LegalSection id="enlaces" title="Enlaces a Otros Sitios Web">
        <p>
          Atriax puede contener enlaces a sitios web de terceros. No somos
          responsables del contenido, políticas de privacidad ni prácticas de
          dichos sitios. El acceso a ellos es bajo su propio riesgo.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>
          Utilizamos cookies para mejorar la experiencia del usuario dentro de
          la plataforma. Las cookies nos permiten recordar sus preferencias y
          personalizar el servicio. Puede desactivarlas desde la configuración
          de su navegador, aunque algunas funciones podrían verse afectadas.
        </p>
      </LegalSection>

      <LegalSection id="cambios" title="Cambios en los Términos">
        <p>
          Atriax se reserva el derecho de modificar estos términos en cualquier
          momento. Le notificaremos sobre cambios relevantes con anticipación
          razonable. El uso continuo de la plataforma después de publicados los
          cambios implica su aceptación.
        </p>
      </LegalSection>

      <LegalSection id="terceros" title="Servicios de Terceros">
        <p>
          Atriax puede integrar servicios de terceros (por ejemplo, herramientas
          de pago o análisis). No somos responsables por las prácticas de
          privacidad ni la disponibilidad de dichos servicios.
        </p>
      </LegalSection>

      <LegalSection id="vigencia" title="Vigencia y Terminación">
        <p>
          Este acuerdo permanece vigente mientras usted sea usuario de Atriax.
          Podemos suspender o cancelar su cuenta en cualquier momento si
          incumple estos términos, sin necesidad de aviso previo.
        </p>
      </LegalSection>

      <LegalSection
        id="derechos-autor"
        title="Aviso de Infracción de Derechos de Autor"
      >
        <p>
          Si considera que algún contenido de Atriax infringe sus derechos de
          autor, por favor envíenos una notificación que incluya:
        </p>
        <LegalList
          items={[
            'Su firma electrónica o física.',
            'Identificación del material protegido que considera infringido.',
            'Identificación del material infractor y su ubicación.',
            'Sus datos de contacto (nombre, dirección, teléfono, email).',
            'Declaración de buena fe sobre el uso no autorizado.',
          ]}
        />
      </LegalSection>

      <LegalSection id="indemnizacion" title="Indemnización">
        <p>
          Usted acepta indemnizar y mantener indemne a Atriax y sus
          colaboradores frente a cualquier reclamo, pérdida o gasto (incluidos
          honorarios legales) que surja de:
        </p>
        <LegalList
          items={[
            'Su uso de la plataforma.',
            'Violaciones a estos Términos.',
            'Infracciones a derechos de terceros.',
          ]}
        />
      </LegalSection>

      <LegalSection id="sin-garantias" title="Sin Garantías">
        <p>
          El servicio se proporciona <strong>"TAL CUAL"</strong> y{' '}
          <strong>"SEGÚN DISPONIBILIDAD"</strong>, sin garantías de ningún tipo,
          expresas o implícitas, incluyendo pero no limitado a garantías de
          comerciabilidad, idoneidad para un propósito particular o no
          infracción.
        </p>
      </LegalSection>

      <LegalSection id="limitacion" title="Limitación de Responsabilidad">
        <p>
          En la medida máxima permitida por la ley aplicable, la responsabilidad
          total de Atriax ante usted por cualquier daño no superará el monto
          total que usted haya pagado a Atriax en los últimos tres (3) meses
          anteriores al evento que originó el reclamo.
        </p>
      </LegalSection>

      <LegalSection id="propiedad-intelectual" title="Propiedad Intelectual">
        <p>
          Todo el contenido de Atriax — incluyendo software, textos, gráficos,
          logotipos, íconos e interfaces — es propiedad exclusiva de Atriax o
          sus licenciantes, y está protegido por las leyes de propiedad
          intelectual aplicables.
        </p>
      </LegalSection>

      <LegalSection id="arbitraje" title="Resolución de Disputas">
        <p>
          Cualquier disputa que surja en relación con estos Términos se
          resolverá, en primera instancia, mediante negociación de buena fe. De
          no alcanzarse un acuerdo, las partes podrán recurrir a arbitraje
          vinculante de conformidad con las leyes de Argentina.
        </p>
        <p>
          Para notificaciones de disputas, contáctenos a través del correo
          indicado en la sección de contacto.
        </p>
      </LegalSection>

      <LegalSection id="acuerdo-completo" title="Acuerdo Completo">
        <p>
          Este documento, junto con la Política de Privacidad de Atriax,
          constituye el acuerdo completo entre usted y Atriax y reemplaza
          cualquier acuerdo previo relacionado con su uso de la plataforma.
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="Contáctenos">
        <p>
          Si tiene preguntas o inquietudes sobre estos Términos y Condiciones,
          puede comunicarse con nosotros a través del formulario de contacto en
          la plataforma o escribiéndonos directamente.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
