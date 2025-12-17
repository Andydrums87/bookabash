import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Hr,
  Heading,
} from '@react-email/components';

export default function SupplierInvoice({
  invoiceNumber = 'INV-2025-00001',
  invoiceDate = '17th December, 2025',
  supplierName = 'Amazing Cakes',
  childName = 'Emily',
  partyDate = '15th January, 2025',
  partyTime = '14:00',
  serviceCategory = 'Cakes',
  grossAmount = '120.00',
  platformFee = '18.00',
  netAmount = '102.00',
  approveLink = 'https://partysnap.co.uk/suppliers/invoices',
  viewInvoiceLink = 'https://partysnap.co.uk/suppliers/invoices',
}) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.companyName}>PartySnap</Text>
            <Text style={styles.headerLabel}>Supplier Invoice</Text>
          </Section>

          {/* Main Icon */}
          <Section style={styles.iconSection}>
            <Text style={styles.icon}>📄</Text>
            <Heading style={styles.title}>New Invoice Ready</Heading>
            <Text style={styles.subtitle}>Review and approve to receive your payout</Text>
          </Section>

          {/* Invoice Summary */}
          <Section style={styles.content}>
            <Section style={styles.invoiceBox}>
              <Row>
                <Column>
                  <Text style={styles.invoiceLabel}>Invoice Number</Text>
                  <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.invoiceLabel}>Date</Text>
                  <Text style={styles.invoiceDate}>{invoiceDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* Greeting */}
            <Section style={styles.greetingSection}>
              <Text style={styles.greeting}>Hi {supplierName},</Text>
              <Text style={styles.greetingText}>
                Great news! Your service has been completed and your invoice is ready for review.
                Please approve this invoice to receive your payout.
              </Text>
            </Section>

            {/* Service Details */}
            <Section style={styles.detailsBox}>
              <Heading as="h3" style={styles.detailsTitle}>Service Details</Heading>
              <Row style={styles.detailRow}>
                <Column style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Event</Text>
                  <Text style={styles.detailValue}>{childName}'s Party</Text>
                </Column>
                <Column style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{serviceCategory}</Text>
                </Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Party Date</Text>
                  <Text style={styles.detailValue}>{partyDate}</Text>
                </Column>
                <Column style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{partyTime}</Text>
                </Column>
              </Row>
            </Section>

            {/* Payment Breakdown */}
            <Section style={styles.paymentBox}>
              <Heading as="h3" style={styles.paymentTitle}>Payment Breakdown</Heading>

              <Row style={styles.lineItem}>
                <Column>
                  <Text style={styles.lineLabel}>Booking Amount</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.lineValue}>£{grossAmount}</Text>
                </Column>
              </Row>

              <Row style={styles.lineItem}>
                <Column>
                  <Text style={styles.lineLabel}>Platform Fee (15%)</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.lineFee}>-£{platformFee}</Text>
                </Column>
              </Row>

              <Hr style={styles.divider} />

              <Row style={styles.totalRow}>
                <Column>
                  <Text style={styles.totalLabel}>Your Payout</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.totalAmount}>£{netAmount}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={approveLink} style={styles.ctaButton}>
                Review & Approve Invoice
              </Button>
              <Text style={styles.ctaNote}>
                Payouts are processed within 5-7 business days after approval
              </Text>
            </Section>

            {/* What to do */}
            <Section style={styles.infoSection}>
              <Heading as="h3" style={styles.infoTitle}>What Happens Next?</Heading>
              <Text style={styles.infoItem}>1. Review the invoice details above</Text>
              <Text style={styles.infoItem}>2. Click "Review & Approve Invoice" to approve</Text>
              <Text style={styles.infoItem}>3. Your payout will be processed within 5-7 business days</Text>
              <Text style={styles.infoNote}>
                If you have any questions about this invoice, you can decline it with a reason
                and our team will be in touch.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerTitle}>PartySnap</Text>
            <Text style={styles.footerText}>hello@partysnap.co.uk</Text>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerSmall}>
              This is an automated invoice notification. Please do not reply to this email.
            </Text>
            <Text style={styles.footerSmall}>
              For support, contact us at hello@partysnap.co.uk
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: '20px',
    backgroundColor: '#f6f9fc',
    color: '#1a1a1a',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  },
  header: {
    padding: '30px 30px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
  },
  companyName: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#F97316',
    letterSpacing: '-0.5px',
  },
  headerLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  iconSection: {
    padding: '40px 30px 30px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  icon: {
    fontSize: '56px',
    margin: '0 0 15px 0',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#6b7280',
  },
  content: {
    padding: '0',
  },
  invoiceBox: {
    padding: '25px 30px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  invoiceLabel: {
    margin: '0 0 5px 0',
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  invoiceNumber: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  invoiceDate: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
  },
  greetingSection: {
    padding: '30px',
  },
  greeting: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  greetingText: {
    margin: 0,
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  detailsBox: {
    padding: '25px 30px',
    backgroundColor: '#f9fafb',
  },
  detailsTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    marginBottom: '15px',
  },
  detailCol: {
    width: '50%',
  },
  detailLabel: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  detailValue: {
    margin: 0,
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: '600',
  },
  paymentBox: {
    padding: '30px',
    backgroundColor: '#ffffff',
  },
  paymentTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  lineItem: {
    padding: '10px 0',
  },
  lineLabel: {
    margin: 0,
    fontSize: '15px',
    color: '#4b5563',
  },
  lineValue: {
    margin: 0,
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: '600',
  },
  lineFee: {
    margin: 0,
    fontSize: '15px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  divider: {
    margin: '15px 0',
    borderTop: '2px solid #e5e7eb',
  },
  totalRow: {
    padding: '10px 0',
  },
  totalLabel: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  totalAmount: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
  },
  ctaSection: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  ctaButton: {
    backgroundColor: '#F97316',
    color: '#ffffff',
    padding: '16px 40px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '600',
    fontSize: '16px',
  },
  ctaNote: {
    margin: '15px 0 0 0',
    fontSize: '13px',
    color: '#6b7280',
  },
  infoSection: {
    padding: '30px',
    backgroundColor: '#ffffff',
  },
  infoTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
  },
  infoItem: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  infoNote: {
    margin: '15px 0 0 0',
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: '1.5',
  },
  footer: {
    padding: '30px',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    textAlign: 'center',
  },
  footerTitle: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#F97316',
  },
  footerText: {
    margin: '5px 0',
    fontSize: '14px',
    color: '#d1d5db',
  },
  footerDivider: {
    margin: '20px 0',
    borderTop: '1px solid #374151',
  },
  footerSmall: {
    margin: '5px 0',
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: '1.5',
  },
};
