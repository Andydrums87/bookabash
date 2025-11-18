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
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755787342/iajcwwtirjnd0spfkley.png"
              alt="PartySnap Logo"
              style={styles.logo}
            />
          </Section>

          {/* Message Banner */}
          <Section style={styles.messageBanner}>
            <Heading as="h2" style={styles.bannerTitle}>💬 {supplierName} sent you a message!</Heading>
            <Text style={styles.bannerSubtitle}>Your {serviceType} provider is excited about {childName}'s party</Text>
          </Section>

          {/* Hero Image */}
          <Img
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683368/bg9f9i7jqo16c5ojwxzj.jpg"
            alt="Celebration scene with party decorations"
            style={styles.heroImage}
          />

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading as="h1" style={styles.mainHeading}>Hello {customerName}!</Heading>
            <Text style={styles.paragraph}>
              We've got great news! {supplierName} has responded to your booking request for {childName}'s {theme} party on {partyDate}.
            </Text>

            {/* Personal Message */}
            <Section style={styles.messageBox}>
              <Heading as="h3" style={styles.messageHeading}>👋 Personal Message from {supplierName}:</Heading>
              <Section style={styles.messageContent}>
                <Text style={styles.messageText}>{supplierMessage}</Text>
              </Section>
            </Section>

            {/* Contact Card */}
            <Section style={styles.contactCard}>
              <Heading as="h3" style={styles.contactHeading}>Let's Connect Directly</Heading>
              <Text style={styles.contactText}>
                {supplierName} would love to connect with you directly to discuss any specific requirements for {childName}'s special day.
              </Text>
              <Row style={styles.contactRow}>
                <Column style={styles.contactBox}>
                  <Text style={styles.contactLabel}>💬 WhatsApp/Call</Text>
                  <Text style={styles.contactValue}>{supplierPhone}</Text>
                </Column>
                <Column style={styles.contactBox}>
                  <Text style={styles.contactLabel}>📧 Email</Text>
                  <Text style={styles.contactValue}>{supplierEmail}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                📱 View Full Booking Details
              </Button>
            </Section>

            {/* What's Next */}
            <Section style={styles.nextStepsBox}>
              <Heading as="h4" style={styles.nextStepsHeading}>🌟 What's Next?</Heading>
              <Text style={styles.nextStepsText}>
                Connect with {supplierName} directly using the contact details above. They'll work with you to ensure {childName}'s {theme} party is absolutely perfect!
              </Text>
              <Text style={styles.nextStepsSubtext}>
                Need help? Our PartySnap team is always here at <strong>0800 123 4567</strong>
              </Text>
            </Section>

            <Text style={styles.closing}>
              Best regards,<br/>
              <strong>The PartySnap Team</strong><br/>
              Connecting families with amazing party professionals ✨
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
    padding: '20px',
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
    padding: '30px 20px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '200px',
    height: 'auto',
    margin: '0 auto',
  },
  messageBanner: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    margin: '10px 0 0 0',
    fontSize: '16px',
    color: 'white',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
  },
  content: {
    padding: '40px 30px',
    backgroundColor: '#FFFFFF',
    color: '#2F2F2F',
  },
  mainHeading: {
    color: '#2F2F2F',
    fontSize: '28px',
    margin: '0 0 20px 0',
  },
  paragraph: {
    color: '#707070',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 25px 0',
  },
  messageBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
    borderLeft: '4px solid #6366f1',
  },
  messageHeading: {
    color: '#4f46e5',
    marginBottom: '15px',
    fontSize: '18px',
  },
  messageContent: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #c7d2fe',
  },
  messageText: {
    color: '#374151',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '16px',
    lineHeight: '1.6',
  },
  contactCard: {
    background: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
  },
  contactHeading: {
    color: '#22c55e',
    margin: '0 0 15px 0',
    fontSize: '18px',
  },
  contactText: {
    color: '#15803d',
    margin: '0 0 15px 0',
    fontSize: '14px',
  },
  contactRow: {
    marginTop: '15px',
  },
  contactBox: {
    textAlign: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    margin: '0 7.5px',
  },
  contactLabel: {
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: '5px',
    fontSize: '14px',
  },
  contactValue: {
    color: '#16a34a',
    fontSize: '14px',
    margin: 0,
  },
  ctaSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  ctaButton: {
    backgroundColor: '#FC6B57',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  nextStepsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    margin: '25px 0',
    border: '1px solid #e2e8f0',
  },
  nextStepsHeading: {
    color: '#475569',
    marginBottom: '10px',
    fontSize: '16px',
  },
  nextStepsText: {
    color: '#64748b',
    margin: '0 0 10px 0',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  nextStepsSubtext: {
    color: '#64748b',
    margin: 0,
    fontSize: '13px',
    fontStyle: 'italic',
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
    padding: '30px',
    textAlign: 'center',
  },
  footerLogo: {
    maxWidth: '120px',
    height: 'auto',
    margin: '0 auto 20px',
    opacity: 0.9,
  },
  footerText: {
    margin: '10px 0',
    color: '#FFFFFF',
    fontSize: '14px',
  },
  footerSmall: {
    fontSize: '12px',
    opacity: 0.8,
    margin: '5px 0',
    color: '#FFFFFF',
  },
};
