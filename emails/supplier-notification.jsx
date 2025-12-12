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

export default function SupplierNotification({
  supplierName = 'there',
  customerName = 'Customer',
  customerEmail = 'customer@example.com',
  customerPhone = '',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  partyTime = '14:00',
  partyLocation = 'Location TBD',
  guestCount = '10-15',
  serviceType = 'party services',
  depositAmount = '0',
  supplierEarning = '0',
  paymentType = 'deposit', // 'deposit' or 'full_payment'
  dashboardLink = 'http://localhost:3000/suppliers/dashboard',
  statusUpdateLink = null, // Quick status update link for cake orders
  isCakeOrder = false, // Whether this is a cake order
}) {
  const paymentTypeDetail = paymentType === 'full_payment'
    ? 'Full payment received: No remaining balance to collect'
    : `Deposit payment: Collect remaining balance (£${Math.round(supplierEarning - depositAmount)}) on party day`;

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap Logo"
              style={styles.logo}
            />
          </Section>

          {/* Urgent Banner */}
          <Section style={styles.urgentBanner}>
            <Heading style={styles.urgentTitle}>🚨 URGENT BOOKING ALERT</Heading>
            <Text style={styles.urgentSubtitle}>Customer has paid deposit - Confirm within 2 hours</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading as="h2" style={styles.mainHeading}>💰 New Paid Booking: {childName}'s {theme} Party</Heading>

            <Text style={styles.paragraph}>Hi {supplierName},</Text>

            <Text style={styles.paragraph}>
              <strong>{customerName}</strong> has just paid a <strong>£{depositAmount} deposit</strong> for {serviceType} services at their child's party.
              This booking is now <strong>priority status</strong> and requires immediate attention.
            </Text>

            {/* Price Highlight */}
            <Section style={styles.priceHighlight}>
              <Heading as="h3" style={styles.priceHeading}>💰 Your Earnings</Heading>
              <Text style={styles.priceAmount}>£{supplierEarning}</Text>
              <Text style={styles.priceStatus}>{paymentType === 'full_payment' ? 'Full Payment' : 'Deposit'} payment secured</Text>
            </Section>

            {/* Time Warning */}
            <Section style={styles.timeWarning}>
              <Row>
                <Column style={styles.timeIconColumn}>
                  <Text style={styles.timeIcon}>⏰</Text>
                </Column>
                <Column style={styles.timeTextColumn}>
                  <Heading as="h3" style={styles.timeHeading}>TIME SENSITIVE: 2 Hour Response Window</Heading>
                  <Text style={styles.timeText}>
                    The customer believes their party is confirmed since they've paid. If you cannot fulfill this booking,
                    we'll immediately find a replacement supplier to maintain their trust.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                🎯 CONFIRM BOOKING NOW
              </Button>
            </Section>

            {/* Booking Details */}
            <Section style={styles.detailsSection}>
              <Heading as="h3" style={styles.detailsHeading}>📋 Booking Details:</Heading>

              <Row style={styles.detailRow}>
                <Column style={styles.detailBox}>
                  <Text style={styles.detailLabel}>PARTY DATE</Text>
                  <Text style={styles.detailValue}>{partyDate}</Text>
                </Column>
                <Column style={styles.detailBox}>
                  <Text style={styles.detailLabel}>PARTY TIME</Text>
                  <Text style={styles.detailValue}>{partyTime}</Text>
                </Column>
              </Row>

              <Row style={styles.detailRow}>
                <Column style={styles.detailBox}>
                  <Text style={styles.detailLabel}>LOCATION</Text>
                  <Text style={styles.detailValue}>{partyLocation}</Text>
                </Column>
                <Column style={styles.detailBox}>
                  <Text style={styles.detailLabel}>GUESTS</Text>
                  <Text style={styles.detailValue}>{guestCount} children</Text>
                </Column>
              </Row>

              <Section style={styles.contactBox}>
                <Text style={styles.detailLabel}>CUSTOMER CONTACT</Text>
                <Text style={styles.contactName}>{customerName}</Text>
                <Text style={styles.contactDetail}>{customerEmail}</Text>
                {customerPhone && <Text style={styles.contactDetail}>{customerPhone}</Text>}
              </Section>
            </Section>

            {/* What This Means */}
            <Section style={styles.successBox}>
              <Heading as="h4" style={styles.successHeading}>✅ What This Means:</Heading>
              <Text style={styles.listItem}>• <strong>Guaranteed booking:</strong> Customer has committed with real money</Text>
              <Text style={styles.listItem}>• <strong>Priority treatment:</strong> This takes precedence over unpaid enquiries</Text>
              <Text style={styles.listItem}>• <strong>{paymentTypeDetail}</strong></Text>
              <Text style={styles.listItem}>• <strong>Immediate action required:</strong> Confirm or decline within 2 hours</Text>
            </Section>

            {/* Can't Fulfill */}
            <Section style={styles.warningBox}>
              <Heading as="h4" style={styles.warningHeading}>⚠️ Can't Fulfill This Booking?</Heading>
              <Text style={styles.warningText}>
                No problem! Simply decline in your dashboard and we'll immediately find a replacement supplier.
                The customer will never know - we handle all communication seamlessly.
              </Text>
            </Section>

            {/* Second CTA */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                📱 OPEN YOUR DASHBOARD
              </Button>
              <Text style={styles.linkText}>Or copy this link: {dashboardLink}</Text>
            </Section>

            {/* Quick Status Update for Cake Orders */}
            {isCakeOrder && statusUpdateLink && (
              <Section style={styles.quickUpdateBox}>
                <Heading as="h4" style={styles.quickUpdateHeading}>🍰 Quick Order Updates</Heading>
                <Text style={styles.quickUpdateText}>
                  Update your order status instantly without logging in! Use this link to mark your order as
                  Confirmed → Preparing → Dispatched → Delivered.
                </Text>
                <Button href={statusUpdateLink} style={styles.quickUpdateButton}>
                  📦 UPDATE ORDER STATUS
                </Button>
                <Text style={styles.quickUpdateNote}>
                  Bookmark this link for easy access when preparing and delivering the cake.
                </Text>
              </Section>
            )}

            <Text style={styles.closing}>
              Time is money - and this customer is ready to pay!<br/>
              <strong>The PartySnap Team</strong><br/>
              Making parties profitable 💰
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap"
              style={styles.footerLogo}
            />
            <Text style={styles.footerText}>PartySnap Ltd, 123 Party Street, London, UK</Text>
            <Text style={styles.footerSmall}>
              You received this because you're a registered supplier with PartySnap.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    margin: 0,
    padding: '10px',
    backgroundColor: '#f8f9fa',
    color: '#2F2F2F',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    padding: '15px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '150px',
    height: 'auto',
    margin: '0 auto',
  },
  urgentBanner: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    padding: '20px 15px',
    textAlign: 'center',
  },
  urgentTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    color: 'white',
  },
  urgentSubtitle: {
    margin: '15px 0 0 0',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
  },
  content: {
    padding: '20px 15px',
    backgroundColor: '#FFFFFF',
    color: '#2F2F2F',
  },
  mainHeading: {
    color: '#dc2626',
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  paragraph: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  priceHighlight: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    margin: '15px 0',
  },
  priceHeading: {
    color: '#92400e',
    margin: '0 0 10px 0',
    fontSize: '18px',
  },
  priceAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#b45309',
    margin: '10px 0',
  },
  priceStatus: {
    color: '#a16207',
    margin: 0,
    fontSize: '14px',
  },
  timeWarning: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '12px',
    padding: '15px',
    margin: '15px 0',
  },
  timeIconColumn: {
    width: '40px',
    verticalAlign: 'top',
  },
  timeIcon: {
    width: '40px',
    height: '40px',
    background: '#dc2626',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '40px',
    margin: 0,
  },
  timeTextColumn: {
    paddingLeft: '15px',
    verticalAlign: 'top',
  },
  timeHeading: {
    color: '#dc2626',
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  timeText: {
    color: '#7f1d1d',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '20px 0',
  },
  ctaButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '18px 36px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '18px',
    textDecoration: 'none',
    display: 'inline-block',
    border: '2px solid #dc2626',
  },
  linkText: {
    margin: '15px 0 0 0',
    color: '#6b7280',
    fontSize: '12px',
  },
  detailsSection: {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '15px',
    margin: '15px 0',
  },
  detailsHeading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '20px',
    color: '#2F2F2F',
  },
  detailRow: {
    marginBottom: '15px',
  },
  detailBox: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    margin: '0 7.5px',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '5px',
  },
  detailValue: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  },
  contactBox: {
    marginTop: '20px',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  contactName: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  contactDetail: {
    color: '#4b5563',
    fontSize: '14px',
    margin: '5px 0',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    borderRadius: '12px',
    padding: '15px',
    margin: '15px 0',
    border: '1px solid #bbf7d0',
  },
  successHeading: {
    color: '#15803d',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  listItem: {
    color: '#166534',
    margin: '8px 0',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  warningBox: {
    backgroundColor: '#fff1f2',
    borderRadius: '12px',
    padding: '15px',
    margin: '15px 0',
    border: '1px solid #fecaca',
  },
  warningHeading: {
    color: '#dc2626',
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  warningText: {
    color: '#991b1b',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  closing: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#707070',
    marginTop: '40px',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    padding: '20px 15px',
    textAlign: 'center',
  },
  footerLogo: {
    maxWidth: '100px',
    height: 'auto',
    margin: '0 auto 15px',
    opacity: 0.9,
  },
  footerText: {
    margin: '10px 0',
    color: '#FFFFFF',
    fontSize: '13px',
  },
  footerSmall: {
    fontSize: '11px',
    opacity: 0.8,
    margin: '5px 0',
    color: '#FFFFFF',
  },
  quickUpdateBox: {
    backgroundColor: '#fdf4ff',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
    border: '2px solid #e879f9',
    textAlign: 'center',
  },
  quickUpdateHeading: {
    color: '#a21caf',
    marginBottom: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  quickUpdateText: {
    color: '#86198f',
    margin: '0 0 15px 0',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  quickUpdateButton: {
    backgroundColor: '#a21caf',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
    border: '2px solid #a21caf',
  },
  quickUpdateNote: {
    color: '#9333ea',
    margin: '15px 0 0 0',
    fontSize: '12px',
    fontStyle: 'italic',
  },
};
