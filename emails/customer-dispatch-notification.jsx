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
  Heading,
  Img,
  Hr,
  Link,
} from '@react-email/components';

export default function CustomerDispatchNotification({
  customerName = 'there',
  childName = 'Emma',
  cakeName = 'Rainbow Sprinkle Cake',
  partyDate = '2025-02-15',
  trackingUrl = 'https://www.royalmail.com/track-your-item#/tracking-results/IV804142085GB',
  trackingNumber: providedTrackingNumber = null,
  courierName = 'Royal Mail',
  cakeCustomization = { flavorName: 'Vanilla', dietaryName: 'Standard' },
  cakeImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
}) {
  const formattedDate = partyDate
    ? new Date(partyDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'your party date';

  // Use provided tracking number or try to extract from URL as fallback
  const getTrackingNumber = () => {
    // If tracking number was provided directly, use it
    if (providedTrackingNumber) return providedTrackingNumber;
    // Otherwise try to extract from URL
    if (!trackingUrl) return null;
    // Try to extract from Royal Mail URL format
    const match = trackingUrl.match(/([A-Z]{2}\d{9}GB)/i);
    if (match) return match[1].toUpperCase();
    // Try to extract from end of URL
    const parts = trackingUrl.split('/');
    const last = parts[parts.length - 1];
    if (last && last.length > 5) return last;
    return null;
  };

  const trackingNumber = getTrackingNumber();

  // Build cake description
  const getCakeDescription = () => {
    const parts = [];
    if (cakeCustomization?.flavorName) parts.push(cakeCustomization.flavorName);
    if (cakeCustomization?.dietaryName && cakeCustomization.dietaryName !== 'Standard') {
      parts.push(cakeCustomization.dietaryName);
    }
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  const cakeDescription = getCakeDescription();

  // Default cake image placeholder
  const defaultCakeImage = 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1734011234/cake-placeholder_xyzabc.png';

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap"
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Your cake is on the way</Heading>

            <Text style={styles.subtext}>
              You can track your order below to see the delivery updates.
            </Text>

            {/* Track Button */}
            {trackingUrl && (
              <Section style={styles.buttonSection}>
                <Button href={trackingUrl} style={styles.trackButton}>
                  Track your order
                </Button>
                {courierName && (
                  <Text style={styles.visitStore}>
                    or <Link href={trackingUrl} style={styles.link}>view on {courierName}</Link>
                  </Text>
                )}
              </Section>
            )}

            {/* Tracking Number */}
            {trackingNumber && (
              <Text style={styles.trackingNumber}>
                {courierName ? `${courierName} tracking number: ` : 'Tracking number: '}<span style={styles.trackingCode}>{trackingNumber}</span>
              </Text>
            )}

            <Hr style={styles.divider} />

            {/* Items in Shipment */}
            <Heading as="h2" style={styles.sectionHeading}>Items in this shipment</Heading>

            <Row style={styles.itemRow}>
              <Column style={styles.itemImageCol}>
                {cakeImage ? (
                  <Img
                    src={cakeImage}
                    alt={cakeName}
                    style={styles.itemImage}
                  />
                ) : (
                  <div style={styles.itemImageWrapper}>
                    <Text style={styles.cakeEmoji}>🎂</Text>
                  </div>
                )}
              </Column>
              <Column style={styles.itemDetailsCol}>
                <Text style={styles.itemName}>{cakeName}</Text>
                {cakeDescription && (
                  <Text style={styles.itemDescription}>{cakeDescription}</Text>
                )}
                <Text style={styles.itemMeta}>For {childName}'s party • {formattedDate}</Text>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              PartySnap Ltd
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
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2F2F2F',
    padding: '24px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '160px',
    height: 'auto',
  },
  content: {
    padding: '40px 32px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '400',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    lineHeight: '1.3',
  },
  subtext: {
    fontSize: '16px',
    color: '#666666',
    margin: '0 0 28px 0',
    lineHeight: '1.5',
  },
  buttonSection: {
    marginBottom: '24px',
  },
  trackButton: {
    backgroundColor: '#2F2F2F',
    color: '#ffffff',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    borderRadius: '4px',
    display: 'inline-block',
  },
  visitStore: {
    fontSize: '14px',
    color: '#666666',
    margin: '12px 0 0 12px',
    display: 'inline-block',
  },
  link: {
    color: '#1a1a1a',
    textDecoration: 'underline',
  },
  trackingNumber: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 8px 0',
  },
  trackingCode: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  divider: {
    borderColor: '#e5e5e5',
    borderWidth: '1px 0 0 0',
    margin: '32px 0',
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 20px 0',
  },
  itemRow: {
    marginBottom: '0',
  },
  itemImageCol: {
    width: '80px',
    verticalAlign: 'top',
  },
  itemImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  itemImageWrapper: {
    width: '70px',
    height: '70px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: '70px',
  },
  cakeEmoji: {
    fontSize: '32px',
    margin: 0,
  },
  itemDetailsCol: {
    verticalAlign: 'top',
    paddingLeft: '16px',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  itemDescription: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 4px 0',
  },
  itemMeta: {
    fontSize: '13px',
    color: '#999999',
    margin: '0',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    padding: '20px 32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: '#999999',
    margin: 0,
  },
};
