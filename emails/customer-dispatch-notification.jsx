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

export default function CustomerDispatchNotification({
  customerName = 'there',
  childName = 'your child',
  cakeName = 'Your cake',
  partyDate = 'your party date',
  trackingUrl = null,
  courierName = null,
  cakeCustomization = {},
}) {
  const formattedDate = partyDate
    ? new Date(partyDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'your party date';

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

          {/* Celebration Banner */}
          <Section style={styles.celebrationBanner}>
            <Text style={styles.cakeEmoji}>🎂</Text>
            <Heading style={styles.bannerTitle}>Your Cake is On Its Way!</Heading>
            <Text style={styles.bannerSubtitle}>Get ready for {childName}'s party</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>

            <Text style={styles.paragraph}>
              Great news! Your cake <strong>"{cakeName}"</strong> for {childName}'s party has been
              dispatched and is on its way to you!
            </Text>

            {/* Delivery Details Box */}
            <Section style={styles.deliveryBox}>
              <Heading as="h3" style={styles.deliveryHeading}>
                📦 Delivery Details
              </Heading>

              <Row style={styles.detailRow}>
                <Column style={styles.detailIcon}>🎂</Column>
                <Column style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Cake</Text>
                  <Text style={styles.detailValue}>{cakeName}</Text>
                </Column>
              </Row>

              <Row style={styles.detailRow}>
                <Column style={styles.detailIcon}>📅</Column>
                <Column style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Party Date</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </Column>
              </Row>

              {courierName && (
                <Row style={styles.detailRow}>
                  <Column style={styles.detailIcon}>🚚</Column>
                  <Column style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Courier</Text>
                    <Text style={styles.detailValue}>{courierName}</Text>
                  </Column>
                </Row>
              )}

              {cakeCustomization?.flavorName && (
                <Row style={styles.detailRow}>
                  <Column style={styles.detailIcon}>✨</Column>
                  <Column style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Flavor</Text>
                    <Text style={styles.detailValue}>{cakeCustomization.flavorName}</Text>
                  </Column>
                </Row>
              )}

              {cakeCustomization?.customMessage && (
                <Row style={styles.detailRow}>
                  <Column style={styles.detailIcon}>💬</Column>
                  <Column style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Message on Cake</Text>
                    <Text style={styles.detailValue}>"{cakeCustomization.customMessage}"</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Tracking Button */}
            {trackingUrl && (
              <Section style={styles.trackingSection}>
                <Text style={styles.trackingText}>
                  Track your delivery in real-time:
                </Text>
                <Button href={trackingUrl} style={styles.trackingButton}>
                  🔍 Track My Cake
                </Button>
                <Text style={styles.trackingLinkText}>
                  Or copy this link: {trackingUrl}
                </Text>
              </Section>
            )}

            {/* Tips Box */}
            <Section style={styles.tipsBox}>
              <Heading as="h4" style={styles.tipsHeading}>🎉 Cake Care Tips</Heading>
              <Text style={styles.tipItem}>• Store in a cool place away from direct sunlight</Text>
              <Text style={styles.tipItem}>• If refrigerated, bring to room temperature 30 mins before serving</Text>
              <Text style={styles.tipItem}>• Handle the box carefully and keep it flat</Text>
              <Text style={styles.tipItem}>• Don't forget to take photos before cutting!</Text>
            </Section>

            <Text style={styles.closing}>
              We hope {childName} has an amazing birthday celebration!<br/>
              <strong>The PartySnap Team</strong> 🎈
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
              You received this email because you ordered a cake through PartySnap.
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
    backgroundColor: '#fdf4ff',
    color: '#2F2F2F',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    maxWidth: '150px',
    height: 'auto',
    margin: '0 auto',
  },
  celebrationBanner: {
    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
    padding: '30px 20px',
    textAlign: 'center',
  },
  cakeEmoji: {
    fontSize: '48px',
    margin: '0 0 10px 0',
  },
  bannerTitle: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '16px',
    margin: 0,
  },
  content: {
    padding: '30px 25px',
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: '18px',
    color: '#374151',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  deliveryBox: {
    backgroundColor: '#faf5ff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    border: '1px solid #e9d5ff',
  },
  deliveryHeading: {
    color: '#7c3aed',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
  },
  detailRow: {
    marginBottom: '15px',
  },
  detailIcon: {
    width: '30px',
    fontSize: '20px',
    verticalAlign: 'top',
    paddingTop: '2px',
  },
  detailContent: {
    paddingLeft: '10px',
    verticalAlign: 'top',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '12px',
    textTransform: 'uppercase',
    margin: '0 0 2px 0',
  },
  detailValue: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  trackingSection: {
    textAlign: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '25px',
    border: '1px solid #bbf7d0',
  },
  trackingText: {
    color: '#166534',
    fontSize: '16px',
    marginBottom: '15px',
  },
  trackingButton: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  trackingLinkText: {
    marginTop: '15px',
    color: '#6b7280',
    fontSize: '12px',
    wordBreak: 'break-all',
  },
  tipsBox: {
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    border: '1px solid #fde68a',
  },
  tipsHeading: {
    color: '#92400e',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  tipItem: {
    color: '#78350f',
    fontSize: '14px',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  closing: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '30px',
    lineHeight: '1.6',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    padding: '25px 20px',
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
};
