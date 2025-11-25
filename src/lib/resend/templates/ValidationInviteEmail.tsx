import * as React from 'react'

export interface ValidationInviteEmailProps {
  ecopointName: string
  ecopointAddress: string
  validationUrl: string
}

var expirationDays = process.env.VALIDATION_TOKEN_EXPIRATION_DAYS || 90;

export const ValidationInviteEmail: React.FC<ValidationInviteEmailProps> = ({
  ecopointName,
  ecopointAddress,
  validationUrl,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
    </head>
    <body style={styles.body}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>🌱 EcoMapa</h1>
          <p style={styles.tagline}>Mapeamento Colaborativo de Iniciativas Regenerativas</p>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          <h2 style={styles.title}>Seu negócio foi adicionado ao EcoMapa!</h2>

          <p style={styles.text}>
            Olá! Gostaríamos de informar que <strong>{ecopointName}</strong> foi adicionado à
            nossa plataforma por um membro da comunidade.
          </p>

          <div style={styles.card}>
            <p style={styles.cardTitle}>📍 {ecopointName}</p>
            <p style={styles.cardAddress}>{ecopointAddress}</p>
          </div>

          <h3 style={styles.subtitle}>O que é o EcoMapa?</h3>
          <p style={styles.text}>
            O EcoMapa é uma plataforma colaborativa que torna visível a rede de iniciativas
            regenerativas no Brasil: feiras ecológicas, hortas comunitárias, ONGs, coletivos e
            negócios sustentáveis.
          </p>

          <h3 style={styles.subtitle}>Valide seu cadastro</h3>
          <p style={styles.text}>
            Para aparecer oficialmente no mapa e começar a receber doações da comunidade,
            precisamos que você valide este cadastro e complete suas informações:
          </p>

          <div style={styles.buttonContainer}>
            <a href={validationUrl} style={styles.button}>
              ✅ Validar Meu Ponto
            </a>
          </div>

          <p style={styles.note}>
            <strong>Benefícios ao validar:</strong>
            <br />• Apareça com badge "Validado" no mapa
            <br />• Receba micro-doações via PIX da comunidade
            <br />• Adicione fotos, horários e informações de contato
            <br />• Gerencie suas informações sempre que quiser
          </p>

          <p style={styles.text}>
            Este link é válido por <strong>{expirationDays} dias</strong>.
          </p>

          <hr style={styles.divider} />

          <p style={styles.smallText}>
            <strong>Não é seu negócio?</strong>
            <br />
            Se este local não pertence a você ou os dados estão incorretos, você pode ignorar este
            email. Caso queira reportar um erro, responda este email.
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            EcoMapa - Desenvolvido pela comunidade Regen Crypto Commons
          </p>
          <p style={styles.footerText}>
            Este é um email automático. Em caso de dúvidas, responda este email.
          </p>
        </div>
      </div>
    </body>
  </html>
)

const styles = {
  body: {
    backgroundColor: '#f3f4f6',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  tagline: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.9,
  },
  content: {
    padding: '32px 24px',
  },
  title: {
    color: '#111827',
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: '16px',
  },
  subtitle: {
    color: '#374151',
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '24px',
    marginBottom: '12px',
  },
  text: {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  cardTitle: {
    color: '#111827',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  cardAddress: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#059669',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-block',
  },
  note: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '16px',
    color: '#047857',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  smallText: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '24px 0',
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#6b7280',
    fontSize: '12px',
    margin: '4px 0',
  },
}