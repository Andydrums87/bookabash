import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from '@react-email/components';

export default function BookingUpgradeReceipt({
  customerName = 'there',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  supplierName = 'Supplier',
  supplierType = 'service',
  previousTotal = 0,
  newTotal = 0,
  amountPaid = 0,
  changes = [],
  dashboardLink = 'https://bookabash.com/dashboard',
}) {
  const formatChange = (change) => {
    switch (change.type) {
      case 'package_changed':
        return `Package: ${change.from} → ${change.to}`;
      case 'price_changed':
        return null; // Don't show price change separately, it's in the summary
      case 'cake_flavor_changed':
        return `Flavour: ${change.from} → ${change.to}`;
      case 'cake_size_changed':
        return `Size: ${change.from} → ${change.to}`;
      case 'dietary_changed':
        return `Dietary: ${change.from} → ${change.to}`;
      case 'fulfillment_changed':
        const fromMethod = change.from === 'delivery' ? 'Delivery' : change.from === 'pickup' ? 'Collection' : change.from;
        const toMethod = change.to === 'delivery' ? 'Delivery' : change.to === 'pickup' ? 'Collection' : change.to;
        return `Delivery method: ${fromMethod} → ${toMethod}`;
      case 'quantity_changed':
        return `Quantity: ${change.from} → ${change.to}`;
      case 'message_changed':
        return `Cake message updated`;
      case 'addons_added':
        return `Add-ons added: ${change.to}`;
      case 'addons_removed':
        return `Add-ons removed: ${change.from}`;
      case 'duration_changed':
        return `Duration: ${change.from} → ${change.to}`;
      default:
        return `${change.type.replace(/_/g, ' ')}: ${change.from || ''} → ${change.to || ''}`;
    }
  };

  // Filter out price_changed from display
  const displayChanges = changes.filter(c => c.type !== 'price_changed');

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logoText}>PartySnap</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading as="h1" style={styles.mainHeading}>
              Booking Updated - Payment Received
            </Heading>

            <Text style={styles.paragraph}>
              Hi {customerName},
            </Text>

            <Text style={styles.paragraph}>
              Your booking with <strong>{supplierName}</strong> for <strong>{childName}'s {theme} party</strong> on <strong>{partyDate}</strong> has been updated.
            </Text>

            <Hr style={styles.divider} />

            {/* Payment Summary */}
            <Text style={styles.sectionTitle}>Payment Summary</Text>

            <Section style={styles.paymentBox}>
              <Text style={styles.paymentRow}>
                <span>Previous total:</span>
                <span>£{Number(previousTotal).toFixed(2)}</span>
              </Text>
              <Text style={styles.paymentRow}>
                <span>New total:</span>
                <span>£{Number(newTotal).toFixed(2)}</span>
              </Text>
              <Hr style={styles.paymentDivider} />
              <Text style={styles.paymentTotal}>
                <span>Additional payment:</span>
                <span style={styles.amountPaid}>£{Number(amountPaid).toFixed(2)}</span>
              </Text>
            </Section>

            {/* What Changed */}
            {displayChanges.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>What changed:</Text>
                <Section style={styles.changesList}>
                  {displayChanges.map((change, index) => {
                    const formatted = formatChange(change);
                    return formatted ? (
                      <Text key={index} style={styles.changeItem}>
                        • {formatted}
                      </Text>
                    ) : null;
                  })}
                </Section>
              </>
            )}

            <Hr style={styles.divider} />

            <Text style={styles.paragraph}>
              This payment has been processed successfully. You can view your updated booking details in your dashboard.
            </Text>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                View Booking
              </Button>
            </Section>

            <Text style={styles.smallText}>
              If you have any questions, please contact us at hello@partysnap.co.uk
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              PartySnap
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    padding: '24px',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#f97316',
    margin: 0,
  },
  content: {
    padding: '32px 24px',
  },
  mainHeading: {
    color: '#111',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px 0',
  },
  paragraph: {
    color: '#333',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  divider: {
    borderColor: '#eee',
    margin: '24px 0',
  },
  sectionTitle: {
    color: '#111',
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  paymentBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    padding: '16px',
    margin: '0 0 24px 0',
    border: '1px solid #bbf7d0',
  },
  paymentRow: {
    color: '#333',
    fontSize: '14px',
    margin: '0 0 8px 0',
    display: 'flex',
    justifyContent: 'space-between',
  },
  paymentDivider: {
    borderColor: '#bbf7d0',
    margin: '12px 0',
  },
  paymentTotal: {
    color: '#111',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
    display: 'flex',
    justifyContent: 'space-between',
  },
  amountPaid: {
    color: '#16a34a',
  },
  changesList: {
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    padding: '16px',
    margin: '0 0 8px 0',
  },
  changeItem: {
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.8',
    margin: '0',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '24px 0',
  },
  ctaButton: {
    backgroundColor: '#f97316',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
  },
  smallText: {
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
  },
  footer: {
    backgroundColor: '#fafafa',
    padding: '16px 24px',
    textAlign: 'center',
    borderTop: '1px solid #eee',
  },
  footerText: {
    color: '#999',
    fontSize: '12px',
    margin: 0,
  },
};
