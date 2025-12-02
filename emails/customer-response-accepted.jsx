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
} from '@react-email/components';

export default function CustomerResponseAccepted({
  customerName = 'there',
  supplierName = 'Supplier',
  supplierEmail = 'supplier@example.com',
  supplierPhone = '01234567890',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  serviceType = 'party services',
  supplierMessage = 'Thank you for choosing our services!',
  dashboardLink = 'https://partysnap.co.uk/dashboard',
}) {
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

          {/* Success Banner */}
          <Section style={styles.successBanner}>
            <Heading style={styles.bannerTitle}>Booking Confirmed!</Heading>
            <Text style={styles.bannerSubtitle}>{supplierName} can't wait to celebrate with you!</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>

            <Text style={styles.paragraph}>
              Your {serviceType} is locked in! <strong>{supplierName}</strong> has confirmed for {childName}'s {theme} party on <strong>{partyDate}</strong>.
            </Text>

            {/* Supplier Message */}
            <Section style={styles.messageBox}>
              <Heading as="h3" style={styles.messageHeading}>Message from {supplierName}:</Heading>
              <Text style={styles.messageText}>"{supplierMessage}"</Text>
            </Section>

            {/* Contact Details */}
            <Section style={styles.contactSection}>
              <Heading as="h3" style={styles.contactHeading}>Ready to Chat?</Heading>
              <Text style={styles.contactIntro}>
                Reach out to discuss any specific requirements for the party.
              </Text>

              <Row style={styles.contactRow}>
                <Column style={styles.contactBox}>
                  <Text style={styles.contactLabel}>Phone / WhatsApp</Text>
                  <Text style={styles.contactValue}>{supplierPhone}</Text>
                </Column>
                <Column style={styles.contactBox}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{supplierEmail}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                View Booking Details
              </Button>
            </Section>

            <Text style={styles.closing}>
              Best regards,<br/>
              <strong>The PartySnap Team</strong>
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
              You received this email because {supplierName} responded to your party booking.
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
    padding: 0,
    backgroundColor: '#ffffff',
    color: '#2F2F2F',
  },
  container: {
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    backgroundColor: 'white',
  },
  header: {
    padding: '20px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '150px',
    height: 'auto',
    margin: '0 auto',
  },
  successBanner: {
    background: 'linear-gradient(135deg, #FC6B57, #e55c48)',
    color: 'white',
    padding: '25px 20px',
    textAlign: 'center',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    margin: '10px 0 0 0',
    fontSize: '16px',
    color: 'white',
  },
  content: {
    padding: '30px 25px',
    backgroundColor: '#FFFFFF',
    color: '#2F2F2F',
  },
  greeting: {
    fontSize: '18px',
    color: '#2F2F2F',
    margin: '0 0 20px 0',
  },
  paragraph: {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 25px 0',
  },
  messageBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 25px 0',
    borderLeft: '4px solid #22c55e',
  },
  messageHeading: {
    color: '#166534',
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  messageText: {
    color: '#374151',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.6',
  },
  contactSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 25px 0',
  },
  contactHeading: {
    color: '#1f2937',
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  contactIntro: {
    color: '#6b7280',
    margin: '0 0 15px 0',
    fontSize: '14px',
  },
  contactRow: {
    marginTop: '10px',
  },
  contactBox: {
    padding: '12px 15px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    margin: '0 5px',
  },
  contactLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    margin: '0 0 5px 0',
  },
  contactValue: {
    color: '#1f2937',
    fontSize: '15px',
    fontWeight: '500',
    margin: 0,
  },
  ctaSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  ctaButton: {
    backgroundColor: '#FC6B57',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  closing: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '30px 0 0 0',
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
