import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface ValidationInviteEmailProps {
  ecopointName: string
  ecopointAddress: string
  validationUrl: string
}

const expirationDays = process.env.VALIDATION_TOKEN_EXPIRATION_DAYS || 90

export const ValidationInviteEmail: React.FC<ValidationInviteEmailProps> = ({
  ecopointName,
  ecopointAddress,
  validationUrl,
}) => (
  <Html>
    <Head />
    <Preview>Seu negócio {ecopointName} foi adicionado ao EcoMapa!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logo}>🌱 EcoMapa</Heading>
          <Text style={tagline}>Mapeamento Colaborativo de Iniciativas Regenerativas</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading as="h2" style={title}>
            Seu negócio foi adicionado ao EcoMapa!
          </Heading>

          <Text style={paragraph}>
            Olá! Gostaríamos de informar que <strong>{ecopointName}</strong> foi adicionado à
            nossa plataforma por um membro da comunidade.
          </Text>

          <Section style={card}>
            <Text style={cardTitle}>📍 {ecopointName}</Text>
            <Text style={cardAddress}>{ecopointAddress}</Text>
          </Section>

          <Heading as="h3" style={subtitle}>
            O que é o EcoMapa?
          </Heading>
          <Text style={paragraph}>
            O EcoMapa é uma plataforma colaborativa que torna visível a rede de iniciativas
            regenerativas no Brasil: feiras ecológicas, hortas comunitárias, ONGs, coletivos e
            negócios sustentáveis.
          </Text>

          <Heading as="h3" style={subtitle}>
            Valide seu cadastro
          </Heading>
          <Text style={paragraph}>
            Para aparecer oficialmente no mapa e começar a receber doações da comunidade,
            precisamos que você valide este cadastro e complete suas informações:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={validationUrl}>
              ✅ Validar Meu Ponto
            </Button>
          </Section>

          <Section style={note}>
            <Text style={noteText}>
              <strong>Benefícios ao validar:</strong>
              <br />• Apareça com badge "Validado" no mapa
              <br />• Receba micro-doações via PIX da comunidade
              <br />• Adicione fotos, horários e informações de contato
              <br />• Gerencie suas informações sempre que quiser
            </Text>
          </Section>

          <Text style={paragraph}>
            Este link é válido por <strong>{expirationDays} dias</strong>.
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            <strong>Não é seu negócio?</strong>
            <br />
            Se este local não pertence a você ou os dados estão incorretos, você pode ignorar este
            email. Caso queira reportar um erro, responda este email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            EcoMapa - Desenvolvido pela comunidade Regen Crypto Commons
          </Text>
          <Text style={footerText}>
            Este é um email automático. Em caso de dúvidas, responda este email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

const header = {
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 0 8px 0',
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
}

const tagline = {
  margin: 0,
  fontSize: '14px',
  opacity: 0.9,
  color: '#ffffff',
}

const content = {
  padding: '32px 24px',
}

const title = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '16px',
}

const subtitle = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '24px',
  marginBottom: '12px',
}

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '16px',
}

const card = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const cardTitle = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const cardAddress = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#059669',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
}

const note = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
}

const noteText = {
  color: '#047857',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0,
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0',
}

export default ValidationInviteEmail
