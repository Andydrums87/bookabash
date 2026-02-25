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
  Img,
} from '@react-email/components';

export default function PaymentConfirmation({
  receiptNumber = 'ABC123',
  paymentDate = '1st January, 2024',
  paymentTime = '14:00',
  paymentIntentId = 'pi_123456789',
  paymentIntentShort = '123456789',
  paymentMethod = 'Card',
  customerName = 'John Smith',
  customerEmail = 'customer@example.com',
  childName = 'Emily',
  childAge = '7',
  theme = 'Princess',
  partyDate = '15th January, 2024',
  partyTime = '14:00',
  location = 'Home, London',
  guestCount = '15',
  services = [],
  addons = [],
  totalPaidToday = '250.00',
  remainingBalance = 0,
  dashboardLink = 'https://partysnap.co.uk/dashboard',
}) {
  const hasRemainingBalance = remainingBalance > 0;

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Professional Header */}
          <Section style={styles.header}>
            <Text style={styles.companyName}>PartySnap</Text>
            <Text style={styles.receiptLabel}>Payment Receipt</Text>
          </Section>

          {/* Success Message */}
          <Section style={styles.successSection}>
            <Text style={styles.successIcon}>✓</Text>
            <Heading style={styles.successTitle}>Payment Successful</Heading>
            <Text style={styles.successSubtitle}>Receipt #{receiptNumber}</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            {/* Summary Box */}
            <Section style={styles.summaryBox}>
              <Row>
                <Column>
                  <Text style={styles.summaryLabel}>Amount Paid</Text>
                  <Text style={styles.summaryAmount}>£{totalPaidToday}</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.summaryLabel}>Receipt #{receiptNumber}</Text>
                  <Text style={styles.summaryDate}>{paymentDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* Party Event Details */}
            <Section style={styles.eventBox}>
              <Heading as="h2" style={styles.eventTitle}>{childName}'s {theme} Party</Heading>
              <Row style={styles.eventRow}>
                <Column style={styles.eventCol}>
                  <Text style={styles.eventLabel}>📅 Date</Text>
                  <Text style={styles.eventValue}>{partyDate}</Text>
                </Column>
                <Column style={styles.eventCol}>
                  <Text style={styles.eventLabel}>🕐 Time</Text>
                  <Text style={styles.eventValue}>{partyTime}</Text>
                </Column>
              </Row>
              <Row style={styles.eventRow}>
                <Column style={styles.eventCol}>
                  <Text style={styles.eventLabel}>📍 Location</Text>
                  <Text style={styles.eventValue}>{location}</Text>
                </Column>
                <Column style={styles.eventCol}>
                  <Text style={styles.eventLabel}>👥 Guests</Text>
                  <Text style={styles.eventValue}>{guestCount} children</Text>
                </Column>
              </Row>
            </Section>

            {/* Services Breakdown */}
            <Section style={styles.breakdownSection}>
              <Heading as="h3" style={styles.breakdownTitle}>Payment Breakdown</Heading>

              {services.map((service, index) => (
                <Row key={index} style={styles.lineItem}>
                  <Column>
                    <Text style={styles.itemName}>{service.name}</Text>
                    <Text style={styles.itemCategory}>{service.category}</Text>
                  </Column>
                  <Column style={{ textAlign: 'right', width: '100px' }}>
                    <Text style={styles.itemPrice}>£{service.price?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.itemBadge}>Full Payment</Text>
                  </Column>
                </Row>
              ))}

              {addons && addons.length > 0 && addons.map((addon, index) => (
                <Row key={`addon-${index}`} style={styles.lineItem}>
                  <Column>
                    <Text style={styles.itemName}>{addon.name}</Text>
                  </Column>
                  <Column style={{ textAlign: 'right', width: '100px' }}>
                    <Text style={styles.itemPrice}>£{addon.price?.toFixed(2) || '0.00'}</Text>
                  </Column>
                </Row>
              ))}

              <Hr style={styles.divider} />

              <Row style={styles.totalRow}>
                <Column>
                  <Text style={styles.totalLabel}>Total Paid Today</Text>
                </Column>
                <Column style={{ textAlign: 'right', width: '100px' }}>
                  <Text style={styles.totalAmount}>£{totalPaidToday}</Text>
                </Column>
              </Row>
            </Section>

            {/* Remaining Balance Alert */}
            {hasRemainingBalance && (
              <Section style={styles.balanceAlert}>
                <Text style={styles.balanceIcon}>💳</Text>
                <Text style={styles.balanceTitle}>Remaining Balance: £{remainingBalance}</Text>
                <Text style={styles.balanceText}>
                  This amount is due on party day and will be paid directly to your suppliers.
                </Text>
              </Section>
            )}

            {/* Payment Details */}
            <Section style={styles.detailsSection}>
              <Heading as="h3" style={styles.detailsTitle}>Payment Details</Heading>
              <table style={styles.detailsTable}>
                <tbody>
                  <tr>
                    <td style={styles.detailLabel}>Transaction ID</td>
                    <td style={styles.detailValue}>{paymentIntentShort}</td>
                  </tr>
                  <tr>
                    <td style={styles.detailLabel}>Payment Method</td>
                    <td style={styles.detailValue}>{paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style={styles.detailLabel}>Date & Time</td>
                    <td style={styles.detailValue}>{paymentDate} at {paymentTime}</td>
                  </tr>
                  <tr>
                    <td style={styles.detailLabel}>Customer</td>
                    <td style={styles.detailValue}>{customerName}</td>
                  </tr>
                  <tr>
                    <td style={styles.detailLabel}>Email</td>
                    <td style={styles.detailValue}>{customerEmail}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* What's Next */}
            <Section style={styles.nextStepsSection}>
              <Heading as="h3" style={styles.nextStepsTitle}>What Happens Next?</Heading>
              <Text style={styles.stepItem}>✓ We personally confirm every supplier for your party</Text>
              <Text style={styles.stepItem}>✓ Full confirmation pack sent within 2 working days</Text>
              <Text style={styles.stepItem}>✓ Suppliers will reach out to finalize details</Text>
              <Text style={styles.stepItem}>✓ Manage everything through your dashboard</Text>
              <Text style={styles.stepItem}>✓ Get ready for an amazing celebration!</Text>
            </Section>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                View Your Dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerTitle}>PartySnap Ltd</Text>
            <Text style={styles.footerText}>123 Party Street, London, UK</Text>
            <Text style={styles.footerText}>hello@partysnap.co.uk • 0800 123 4567</Text>
            <Text style={styles.footerText}>VAT: GB123456789</Text>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerSmall}>
              This email serves as your official payment receipt and booking confirmation.
            </Text>
            <Text style={styles.footerSmall}>
              Questions? Reply to this email or contact our support team.
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
    padding: '40px 30px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
  },
  companyName: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.5px',
  },
  receiptLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  successSection: {
    padding: '40px 30px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  successIcon: {
    fontSize: '64px',
    margin: '0 0 15px 0',
    color: '#10b981',
  },
  successTitle: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: '-0.5px',
  },
  successSubtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#6b7280',
  },
  content: {
    padding: '0',
  },
  summaryBox: {
    padding: '30px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e5e7eb',
  },
  summaryLabel: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  summaryAmount: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    color: '#10b981',
  },
  summaryDate: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
  },
  eventBox: {
    padding: '30px',
    backgroundColor: '#fff',
  },
  eventTitle: {
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  eventRow: {
    marginBottom: '15px',
  },
  eventCol: {
    width: '50%',
    padding: '0 10px',
  },
  eventLabel: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
  eventValue: {
    margin: 0,
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: '600',
  },
  breakdownSection: {
    padding: '30px',
    backgroundColor: '#fafafa',
  },
  breakdownTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  lineItem: {
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  itemName: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
  },
  itemCategory: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  itemPrice: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1f2937',
  },
  itemBadge: {
    fontSize: '11px',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'inline-block',
    fontWeight: '600',
  },
  divider: {
    margin: '20px 0',
    borderTop: '2px solid #d1d5db',
  },
  totalRow: {
    padding: '15px 0',
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
  balanceAlert: {
    padding: '20px',
    margin: '0 30px 30px',
    backgroundColor: '#fffbeb',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    textAlign: 'center',
  },
  balanceIcon: {
    fontSize: '32px',
    margin: '0 0 10px 0',
  },
  balanceTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#92400e',
  },
  balanceText: {
    margin: 0,
    fontSize: '14px',
    color: '#78350f',
    lineHeight: '1.5',
  },
  detailsSection: {
    padding: '30px',
    backgroundColor: '#fff',
  },
  detailsTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  detailLabel: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#6b7280',
    width: '40%',
  },
  detailValue: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600',
  },
  nextStepsSection: {
    padding: '30px',
    backgroundColor: '#f9fafb',
  },
  nextStepsTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  stepItem: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  ctaSection: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  ctaButton: {
    backgroundColor: '#FC6B57',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '600',
    fontSize: '16px',
  },
  footer: {
    padding: '30px',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    textAlign: 'center',
  },
  footerTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#f9fafb',
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
