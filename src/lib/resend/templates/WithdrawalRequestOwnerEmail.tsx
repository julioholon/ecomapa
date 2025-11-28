import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components'
import * as React from 'react'

export interface WithdrawalRequestOwnerEmailProps {
  ecopointName: string
  amountGross: number
  platformFee: number
  amountNet: number
  pixKey: string
  pixKeyType: string
}

export const WithdrawalRequestOwnerEmail: React.FC<
  WithdrawalRequestOwnerEmailProps
> = ({
  ecopointName,
  amountGross,
  platformFee,
  amountNet,
  pixKey,
  pixKeyType,
}) => (
  <Html>
    <Head />
    <Preview>
      💸 Saque de R$ {amountNet.toFixed(2)} solicitado com sucesso - EcoMapa
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={title}>💸 Saque Solicitado com Sucesso!</Text>
        </Section>

        <Section style={content}>
          <Text style={greeting}>Olá! 👋</Text>

          <Text style={paragraph}>
            Sua solicitação de saque para o ecoponto{' '}
            <strong>{ecopointName}</strong> foi recebida com sucesso.
          </Text>

          <Section style={amountBox}>
            <Text style={amountLabel}>Valor solicitado:</Text>
            <Text style={amountValue}>R$ {amountGross.toFixed(2)}</Text>

            <Hr style={divider} />

            <Section style={breakdown}>
              <Text style={breakdownItem}>
                <span style={breakdownLabel}>Valor bruto:</span>
                <span style={breakdownValue}>
                  R$ {amountGross.toFixed(2)}
                </span>
              </Text>
              <Text style={breakdownItem}>
                <span style={breakdownLabel}>Taxa da plataforma (10%):</span>
                <span style={breakdownValue}>
                  - R$ {platformFee.toFixed(2)}
                </span>
              </Text>
              <Hr style={dividerSmall} />
              <Text style={breakdownItem}>
                <span style={breakdownLabelBold}>Você receberá:</span>
                <span style={breakdownValueBold}>
                  R$ {amountNet.toFixed(2)}
                </span>
              </Text>
            </Section>
          </Section>

          <Section style={pixBox}>
            <Text style={pixLabel}>Chave PIX para recebimento:</Text>
            <Text style={pixValue}>{pixKey}</Text>
            <Text style={pixType}>Tipo: {pixKeyType}</Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoTitle}>⏰ Prazo de Processamento</Text>
            <Text style={infoText}>
              O saque será processado em até <strong>24 a 48 horas úteis</strong>.
              Você receberá o pagamento via PIX na chave informada.
            </Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoTitle}>💡 Importante</Text>
            <Text style={infoText}>
              • Certifique-se de que a chave PIX está correta
              <br />
              • A taxa de 10% ajuda a manter a plataforma funcionando
              <br />
              • Você pode acompanhar o status do saque no seu dashboard
              <br />• Em caso de dúvidas, entre em contato conosco
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/solicitar-saque`}
            >
              Ver Meus Saques
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Obrigado por fazer parte do EcoMapa! 🌱
            <br />
            Juntos estamos construindo um futuro mais regenerativo.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WithdrawalRequestOwnerEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  backgroundColor: '#10b981',
  borderRadius: '8px 8px 0 0',
}

const title = {
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#ffffff',
}

const content = {
  padding: '24px',
}

const greeting = {
  fontSize: '18px',
  marginBottom: '16px',
  color: '#333333',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#555555',
  marginBottom: '24px',
}

const amountBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const amountLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const amountValue = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#10b981',
  margin: '0 0 16px 0',
}

const breakdown = {
  textAlign: 'left' as const,
  marginTop: '16px',
}

const breakdownItem = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  margin: '8px 0',
  color: '#555555',
}

const breakdownLabel = {
  color: '#6b7280',
}

const breakdownValue = {
  color: '#111827',
  fontWeight: '500',
}

const breakdownLabelBold = {
  color: '#111827',
  fontWeight: 'bold',
  fontSize: '16px',
}

const breakdownValueBold = {
  color: '#10b981',
  fontWeight: 'bold',
  fontSize: '16px',
}

const pixBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const pixLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const pixValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px 0',
  wordBreak: 'break-all' as const,
}

const pixType = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
}

const infoTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
}

const infoText = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const dividerSmall = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
}

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'center' as const,
  lineHeight: '20px',
}
