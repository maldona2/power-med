import {
  LegalLayout,
  LegalSection,
  LegalList,
  LegalDefinitions,
} from '@/components/landing/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="2025-12-12">
      <p className="text-muted-foreground leading-relaxed">
        Atriax ("nosotros", "nuestro" o "nos") se compromete a proteger su
        privacidad. Esta Política de Privacidad explica cómo se recopila,
        utiliza y divulga su información personal cuando utiliza nuestra
        plataforma. Al acceder o utilizar Atriax, usted indica que ha leído,
        entendido y acepta los términos aquí descritos.
      </p>

      <LegalSection id="definiciones" title="Definiciones y Términos Clave">
        <LegalDefinitions
          entries={[
            {
              term: 'Cookie',
              definition:
                'Pequeña cantidad de datos almacenada por el navegador web.',
            },
            {
              term: 'Compañía',
              definition:
                'Atriax, responsable del tratamiento de su información personal.',
            },
            {
              term: 'País',
              definition: 'Argentina.',
            },
            {
              term: 'Cliente',
              definition:
                'Persona u organización que utiliza los servicios de Atriax.',
            },
            {
              term: 'Dispositivo',
              definition: 'Cualquier equipo con acceso a internet.',
            },
            {
              term: 'Dirección IP',
              definition:
                'Número único que identifica a un dispositivo en una red de internet.',
            },
            {
              term: 'Datos Personales',
              definition:
                'Información que permite identificar a una persona, directa o indirectamente.',
            },
            {
              term: 'Servicio',
              definition: 'La plataforma web y móvil de Atriax.',
            },
            {
              term: 'Servicio de terceros',
              definition:
                'Socios, proveedores de pago, herramientas de análisis u otros servicios integrados.',
            },
            {
              term: 'Usted',
              definition:
                'El usuario que accede y utiliza la plataforma Atriax.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="que-recopilamos" title="¿Qué Información Recopilamos?">
        <p>
          Recopilamos información cuando usted interactúa con Atriax, por
          ejemplo al:
        </p>
        <LegalList
          items={[
            'Visitar la plataforma o el sitio web.',
            'Registrarse y crear una cuenta.',
            'Completar formularios o configurar su perfil.',
            'Contactar al equipo de soporte.',
          ]}
        />
        <p>La información que podemos recopilar incluye:</p>
        <LegalList
          items={[
            'Nombre completo y nombre de usuario.',
            'Dirección de correo electrónico.',
            'Número de teléfono.',
            'Especialidad médica y datos profesionales.',
            'Dirección de facturación.',
            'Datos de actividad dentro de la plataforma.',
          ]}
        />
      </LegalSection>

      <LegalSection id="como-usamos" title="¿Cómo Usamos la Información?">
        <p>Utilizamos la información recopilada para:</p>
        <LegalList
          items={[
            'Personalizar y mejorar su experiencia en la plataforma.',
            'Gestionar su cuenta y suscripción.',
            'Brindarle soporte técnico y atención al cliente.',
            'Procesar transacciones de manera segura.',
            'Enviar comunicaciones relevantes sobre el servicio y actualizaciones.',
            'Analizar el uso de la plataforma para mejorar su funcionamiento.',
          ]}
        />
      </LegalSection>

      <LegalSection id="informacion-terceros" title="Información de Terceros">
        <p>En determinados casos podemos recopilar información de:</p>
        <LegalList
          items={[
            'Redes sociales, si usted vincula su cuenta o hace información pública.',
            'Herramientas de prevención de fraude y verificación de identidad.',
            'Fuentes públicas o registros profesionales.',
          ]}
        />
      </LegalSection>

      <LegalSection id="comparticion" title="Compartición de Datos">
        <p>
          Atriax no vende su información personal. Podemos compartir datos en
          las siguientes circunstancias:
        </p>
        <LegalList
          items={[
            'Con proveedores de servicios que nos ayudan a operar la plataforma (ej. procesadores de pago, servicios de correo).',
            'Con socios comerciales bajo acuerdos de confidencialidad.',
            'Con empresas afiliadas dentro de nuestro grupo.',
            'Con autoridades competentes cuando sea requerido por ley o resolución judicial.',
          ]}
        />
      </LegalSection>

      <LegalSection id="email" title="Uso del Correo Electrónico">
        <p>
          Al proporcionar su dirección de correo electrónico, usted acepta
          recibir comunicaciones relacionadas con el servicio (notificaciones,
          actualizaciones, facturas). También podrá recibir comunicaciones de
          marketing opcionales.
        </p>
        <p>
          Puede darse de baja de las comunicaciones de marketing en cualquier
          momento haciendo clic en "Cancelar suscripción" en el correo recibido
          o contactándonos directamente.
        </p>
      </LegalSection>

      <LegalSection id="retencion" title="Retención de Datos">
        <p>
          Conservamos su información personal únicamente durante el tiempo
          necesario para los fines descritos en esta política y para cumplir con
          obligaciones legales. Una vez que ya no sea necesaria, la eliminamos o
          anonimizamos de forma segura.
        </p>
      </LegalSection>

      <LegalSection id="seguridad" title="Seguridad">
        <p>
          Implementamos medidas de seguridad técnicas y organizativas adecuadas
          para proteger su información, incluyendo cifrado SSL/TLS, control de
          acceso y auditorías periódicas.
        </p>
        <p>
          Sin embargo, ningún método de transmisión por Internet o
          almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por
          proteger sus datos, no podemos garantizar seguridad absoluta.
        </p>
      </LegalSection>

      <LegalSection id="transferencias" title="Transferencias Internacionales">
        <p>
          Su información puede almacenarse y procesarse en servidores ubicados
          fuera de Argentina. En tales casos, nos aseguramos de que existan
          salvaguardas adecuadas para proteger sus datos de conformidad con la
          legislación aplicable.
        </p>
      </LegalSection>

      <LegalSection id="derechos" title="Sus Derechos">
        <p>Como usuario de Atriax, usted tiene derecho a:</p>
        <LegalList
          items={[
            'Acceder a la información personal que tenemos sobre usted.',
            'Corregir datos inexactos o incompletos.',
            'Solicitar la eliminación de su información.',
            'Oponerse al tratamiento de sus datos para fines de marketing.',
            'Cambiar sus preferencias de comunicación en cualquier momento.',
          ]}
        />
        <p>
          Para ejercer sus derechos, contáctenos a través del formulario de
          soporte en la plataforma.
        </p>
      </LegalSection>

      <LegalSection id="venta-negocio" title="Transferencia del Negocio">
        <p>
          En caso de fusión, adquisición o venta de activos, su información
          personal podría transferirse a la entidad resultante. Le notificaremos
          con anticipación y le informaremos sobre sus opciones en dicha
          circunstancia.
        </p>
      </LegalSection>

      <LegalSection id="ley-aplicable" title="Ley Aplicable">
        <p>
          Esta Política de Privacidad se rige por las leyes de la República
          Argentina, en particular la Ley N.º 25.326 de Protección de Datos
          Personales y sus normas reglamentarias.
        </p>
      </LegalSection>

      <LegalSection id="consentimiento" title="Consentimiento">
        <p>
          Al utilizar Atriax, usted declara haber leído y aceptado esta Política
          de Privacidad. Si no está de acuerdo con alguna parte de esta
          política, le pedimos que no utilice el servicio.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies y Tecnologías de Seguimiento">
        <p>Atriax utiliza cookies para:</p>
        <LegalList
          items={[
            'Mantener su sesión activa.',
            'Recordar sus preferencias de uso.',
            'Analizar el comportamiento en la plataforma para mejoras.',
          ]}
        />
        <p>
          Puede administrar o deshabilitar las cookies desde la configuración de
          su navegador. Tenga en cuenta que deshabilitar ciertas cookies puede
          afectar la funcionalidad de la plataforma.
        </p>
      </LegalSection>

      <LegalSection id="pagos" title="Pagos">
        <p>
          Los datos de pago (tarjeta de crédito, débito u otros medios) son
          gestionados por procesadores de pago externos certificados (PCI-DSS).
          Atriax no almacena datos de tarjetas de crédito en sus servidores.
        </p>
      </LegalSection>

      <LegalSection id="menores" title="Privacidad de Menores">
        <p>
          Atriax no está dirigido a menores de 13 años y no recopila
          intencionalmente información personal de menores. Si usted cree que un
          menor ha proporcionado datos sin consentimiento parental, contáctenos
          para proceder a su eliminación.
        </p>
      </LegalSection>

      <LegalSection id="cambios" title="Cambios en esta Política">
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Le
          notificaremos sobre cambios significativos mediante correo electrónico
          o un aviso visible en la plataforma antes de que los cambios entren en
          vigor. Le recomendamos revisar esta política con regularidad.
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="Contacto">
        <p>
          Si tiene preguntas, comentarios o solicitudes relacionadas con esta
          Política de Privacidad o el tratamiento de sus datos personales, puede
          comunicarse con nosotros a través del formulario de soporte dentro de
          la plataforma Atriax.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
