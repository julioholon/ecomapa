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

export interface WithdrawalRequestAdminEmailProps {
  withdrawalId: string
  ecopointName: string
  ecopointId: string
  ownerName: string
  ownerEmail: string
  amountGross: number
  platformFee: number
  amountNet: number
  pixKey: string
  pixKeyType: string
  requestedAt: string
}

export const WithdrawalRequestAdminEmail: React.FC<
  WithdrawalRequestAdminEmailProps
> = ({
  withdrawalId,
  ecopointName,
  ecopointId,
  ownerName,
  ownerEmail,
  amountGross,
  platformFee,
  amountNet,
  pixKey,
  pixKeyType,
  requestedAt,
}) => (
  <Html>
    <Head />
    <Preview>
      🚨 AÇÃO NECESSÁRIA: Novo saque de R$ {amountNet.toFixed(2)} - EcoMapa
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={title}>🚨 Novo Saque Pendente</Text>
          <Text style={subtitle}>AÇÃO NECESSÁRIA</Text>
        </Section>

        <Section style={content}>
          <Text style={greeting}>Olá, Admin! 👋</Text>

          <Text style={paragraph}>
            Uma nova solicitação de saque foi realizada e precisa ser processada
            manualmente.
          </Text>

          <Section style={alertBox}>
            <Text style={alertTitle}>💰 VALOR A TRANSFERIR</Text>
            <Text style={alertAmount}>R$ {amountNet.toFixed(2)}</Text>
            <Text style={alertSubtext}>
              (90% do valor solicitado - 10% retido para a plataforma)
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={detailsSection}>
            <Text style={sectionTitle}>📊 Detalhes Financeiros</Text>

            <Section style={detailsGrid}>
              <Text style={detailItem}>
                <span style={detailLabel}>Valor bruto solicitado:</span>
                <span style={detailValue}>R$ {amountGross.toFixed(2)}</span>
              </Text>
              <Text style={detailItem}>
                <span style={detailLabel}>Taxa da plataforma (10%):</span>
                <span style={detailValueGreen}>
                  R$ {platformFee.toFixed(2)}
                </span>
              </Text>
              <Text style={detailItem}>
                <span style={detailLabelBold}>Valor líquido (transferir):</span>
                <span style={detailValueBold}>R$ {amountNet.toFixed(2)}</span>
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={detailsSection}>
            <Text style={sectionTitle}>🏪 Dados do Ecoponto</Text>

            <Section style={detailsGrid}>
              <Text style={detailItem}>
                <span style={detailLabel}>Nome:</span>
                <span style={detailValue}>{ecopointName}</span>
              </Text>
              <Text style={detailItem}>
                <span style={detailLabel}>ID:</span>
                <span style={detailValue}>{ecopointId}</span>
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={detailsSection}>
            <Text style={sectionTitle}>👤 Dados do Proprietário</Text>

            <Section style={detailsGrid}>
              <Text style={detailItem}>
                <span style={detailLabel}>Nome:</span>
                <span style={detailValue}>{ownerName}</span>
              </Text>
              <Text style={detailItem}>
                <span style={detailLabel}>Email:</span>
                <span style={detailValue}>{ownerEmail}</span>
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={pixSection}>
            <Text style={sectionTitle}>💳 Dados PIX para Transferência</Text>

            <Section style={pixBox}>
              <Text style={pixLabel}>Tipo de Chave:</Text>
              <Text style={pixType}>{pixKeyType}</Text>

              <Text style={pixLabel}>Chave PIX:</Text>
              <Section style={pixKeyBox}>
                <Text style={pixKeyValue}>{pixKey}</Text>
              </Section>

              <Text style={pixHint}>
                ☝️ Clique para selecionar e copiar a chave PIX
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={detailsSection}>
            <Text style={sectionTitle}>📅 Informações da Solicitação</Text>

            <Section style={detailsGrid}>
              <Text style={detailItem}>
                <span style={detailLabel}>ID do Saque:</span>
                <span style={detailValue}>{withdrawalId}</span>
              </Text>
              <Text style={detailItem}>
                <span style={detailLabel}>Data/Hora:</span>
                <span style={detailValue}>{requestedAt}</span>
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={instructionsBox}>
            <Text style={instructionsTitle}>📋 Instruções para Processar</Text>
            <Text style={instructionsText}>
              1. Abra o app do seu banco ou instituição de pagamento
              <br />
              2. Selecione a opção PIX
              <br />
              3. Copie a chave PIX acima ({pixKeyType})
              <br />
              4. Cole no campo de chave do destinatário
              <br />
              5. Insira o valor: <strong>R$ {amountNet.toFixed(2)}</strong>
              <br />
              6. Confirme os dados e realize a transferência
              <br />
              7. Salve o comprovante para registros
              <br />
              8. Atualize o status no banco de dados (futuro: via dashboard)
            </Text>
          </Section>

          <Section style={warningBox}>
            <Text style={warningTitle}>⚠️ Atenção</Text>
            <Text style={warningText}>
              • Verifique se a chave PIX está correta antes de transferir
              <br />
              • O prazo comprometido é de 24-48h úteis
              <br />
              • Guarde o comprovante da transferência
              <br />• Em caso de dúvida, entre em contato com o proprietário
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/solicitar-saque`}
            >
              Ver no Dashboard
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            EcoMapa - Sistema de Gestão de Saques
            <br />
            Este é um email automático. Não responda.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WithdrawalRequestAdminEmail

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
  backgroundColor: '#dc2626',
  borderRadius: '8px 8px 0 0',
}

const title = {
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#ffffff',
}

const subtitle = {
  margin: '8px 0 0 0',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#fecaca',
  letterSpacing: '2px',
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

const alertBox = {
  backgroundColor: '#fef2f2',
  border: '3px solid #dc2626',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const alertTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 12px 0',
  letterSpacing: '1px',
}

const alertAmount = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px 0',
}

const alertSubtext = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '0',
}

const detailsSection = {
  marginBottom: '24px',
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
}

const detailsGrid = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
}

const detailItem = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  margin: '8px 0',
  color: '#555555',
}

const detailLabel = {
  color: '#6b7280',
}

const detailValue = {
  color: '#111827',
  fontWeight: '500',
}

const detailValueGreen = {
  color: '#10b981',
  fontWeight: '600',
}

const detailLabelBold = {
  color: '#111827',
  fontWeight: 'bold',
  fontSize: '15px',
}

const detailValueBold = {
  color: '#dc2626',
  fontWeight: 'bold',
  fontSize: '18px',
}

const pixSection = {
  marginBottom: '24px',
}

const pixBox = {
  backgroundColor: '#fef9c3',
  border: '2px solid #eab308',
  borderRadius: '8px',
  padding: '20px',
}

const pixLabel = {
  fontSize: '12px',
  color: '#854d0e',
  margin: '0 0 4px 0',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
}

const pixType = {
  fontSize: '16px',
  color: '#713f12',
  margin: '0 0 16px 0',
  fontWeight: '600',
}

const pixKeyBox = {
  backgroundColor: '#ffffff',
  border: '2px dashed #eab308',
  borderRadius: '6px',
  padding: '16px',
  marginTop: '8px',
  marginBottom: '8px',
}

const pixKeyValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
  textAlign: 'center' as const,
}

const pixHint = {
  fontSize: '12px',
  color: '#854d0e',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
}

const instructionsBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
}

const instructionsTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px 0',
}

const instructionsText = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '24px',
}

const warningBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fdba74',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const warningTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#c2410c',
  margin: '0 0 8px 0',
}

const warningText = {
  fontSize: '14px',
  color: '#9a3412',
  margin: '0',
  lineHeight: '20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#dc2626',
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

const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  lineHeight: '18px',
}
