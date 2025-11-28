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

export interface DonationReceivedEmailProps {
  ecopointName: string
  amount: number
  donorName?: string
  totalReceived: number
  donationsCount: number
  dashboardUrl: string
}

export const DonationReceivedEmail: React.FC<DonationReceivedEmailProps> = ({
  ecopointName,
  amount,
  donorName,
  totalReceived,
  donationsCount,
  dashboardUrl,
}) => (
  <Html>
    <Head />
    <Preview>💰 Você recebeu uma nova doação de R$ {amount.toFixed(2)} no EcoMapa!</Preview>
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
            💰 Você recebeu uma doação!
          </Heading>

          <Text style={paragraph}>
            Ótimas notícias! Alguém da comunidade apoiou <strong>{ecopointName}</strong> com uma
            doação via PIX.
          </Text>

          <Section style={donationCard}>
            <Text style={amountLabel}>Valor recebido:</Text>
            <Text style={amountValue}>R$ {amount.toFixed(2)}</Text>
            {donorName && (
              <Text style={donorText}>
                De: <strong>{donorName}</strong>
              </Text>
            )}
          </Section>

          <Section style={statsCard}>
            <Text style={statsTitle}>📊 Suas estatísticas</Text>
            <Section style={statsRow}>
              <Section style={statItem}>
                <Text style={statLabel}>Total recebido</Text>
                <Text style={statValue}>R$ {totalReceived.toFixed(2)}</Text>
              </Section>
              <Section style={statItem}>
                <Text style={statLabel}>Doações</Text>
                <Text style={statValue}>{donationsCount}</Text>
              </Section>
            </Section>
          </Section>

          <Text style={paragraph}>
            O valor já está disponível no seu dashboard. Você pode acompanhar todas as suas doações
            e solicitar saque a qualquer momento.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Ver Doações Recebidas
            </Button>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Dica</Text>
            <Text style={tipText}>
              Quanto mais ativa sua iniciativa estiver na plataforma (com fotos, informações
              atualizadas e boas avaliações), mais doações você tende a receber!
            </Text>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            <strong>Como solicitar saque?</strong>
            <br />
            Acesse seu dashboard e clique em "Solicitar Saque". O processamento leva de 24 a 48
            horas úteis. Cobramos uma taxa de 10% para manter a plataforma funcionando.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            EcoMapa - Desenvolvido pela comunidade Regen Crypto Commons
          </Text>
          <Text style={footerText}>
            Obrigado por fazer parte da rede regenerativa! 🌱
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

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '16px',
}

const donationCard = {
  backgroundColor: '#ecfdf5',
  border: '2px solid #10b981',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const amountLabel = {
  color: '#047857',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px 0',
}

const amountValue = {
  color: '#059669',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const donorText = {
  color: '#047857',
  fontSize: '14px',
  margin: 0,
}

const statsCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const statsTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const statsRow = {
  display: 'flex' as const,
  justifyContent: 'space-around' as const,
}

const statItem = {
  textAlign: 'center' as const,
  flex: 1,
}

const statLabel = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
}

const statValue = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
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

const tipBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
}

const tipTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const tipText = {
  color: '#78350f',
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

export default DonationReceivedEmail
