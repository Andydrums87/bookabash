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
} from '@react-email/components';

export default function CustomerCollectionReadyNotification({
  customerName = 'there',
  childName = 'Emma',
  cakeName = 'Rainbow Sprinkle Cake',
  partyDate = '2025-02-15',
  pickupLocation = '123 Baker Street, London, W1U 8ED',
  cakeCustomization = { flavorName: 'Vanilla', dietaryName: 'Standard' },
  cakeImage = null,
}) {
  const formattedDate = partyDate
    ? new Date(partyDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'your party date';

  // Build cake description
  const getCakeDescription = () => {
    const parts = [];
    if (cakeCustomization?.size) parts.push(cakeCustomization.size);
    if (cakeCustomization?.flavorName) parts.push(cakeCustomization.flavorName);
    if (cakeCustomization?.dietaryName && cakeCustomization.dietaryName !== 'Standard') {
      parts.push(cakeCustomization.dietaryName);
    }
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  const cakeDescription = getCakeDescription();

  // Generate Google Maps link for the pickup location
  const getMapsLink = () => {
    if (!pickupLocation) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupLocation)}`;
  };

  const mapsLink = getMapsLink();

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
            <Heading style={styles.heading}>Your cake is ready for collection!</Heading>

            <Text style={styles.subtext}>
              Great news! Your cake for {childName}'s party is ready and waiting for you to pick up.
            </Text>

            {/* Pickup Location Box */}
            {pickupLocation && (
              <Section style={styles.locationBox}>
                <Text style={styles.locationLabel}>📍 Collection Address</Text>
                <Text style={styles.locationAddress}>{pickupLocation}</Text>
                {mapsLink && (
                  <Button href={mapsLink} style={styles.mapsButton}>
                    Get Directions
                  </Button>
                )}
              </Section>
            )}

            <Hr style={styles.divider} />

            {/* Items for Collection */}
            <Heading as="h2" style={styles.sectionHeading}>Your order</Heading>

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

            <Hr style={styles.divider} />

            {/* Helpful Tips */}
            <Section style={styles.tipsSection}>
              <Heading as="h3" style={styles.tipsHeading}>Collection tips</Heading>
              <Text style={styles.tipItem}>• Keep the cake level when transporting</Text>
              <Text style={styles.tipItem}>• Store in a cool place until the party</Text>
              <Text style={styles.tipItem}>• Refrigerate if it has fresh cream filling</Text>
            </Section>
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
  locationBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  locationLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#166534',
    margin: '0 0 8px 0',
  },
  locationAddress: {
    fontSize: '16px',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  mapsButton: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    borderRadius: '4px',
    display: 'inline-block',
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
  tipsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
  },
  tipsHeading: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
  },
  tipItem: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 6px 0',
    lineHeight: '1.4',
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
