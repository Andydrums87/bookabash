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

export default function CustomerResponseDeclined({
  customerName = 'there',
  supplierName = 'Supplier',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  serviceType = 'party services',
  supplierMessage = 'Thank you for your interest in our services.',
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

          {/* Update Banner */}
          <Section style={styles.updateBanner}>
            <Heading style={styles.bannerTitle}>Booking Update</Heading>
            <Text style={styles.bannerSubtitle}>We're finding you an alternative</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>

            <Text style={styles.paragraph}>
              We have an update about your {serviceType} booking for {childName}'s {theme} party on <strong>{partyDate}</strong>.
            </Text>

            <Text style={styles.paragraph}>
              Unfortunately, {supplierName} is not available for your requested date. Don't worry - we're already working to find you an excellent alternative.
            </Text>

            {/* Supplier Message */}
            <Section style={styles.messageBox}>
              <Heading as="h3" style={styles.messageHeading}>Message from {supplierName}:</Heading>
              <Text style={styles.messageText}>"{supplierMessage}"</Text>
            </Section>

            {/* What's Next */}
            <Section style={styles.stepsSection}>
              <Heading as="h3" style={styles.stepsHeading}>What Happens Next</Heading>

              <Section style={styles.stepItem}>
                <Text style={styles.stepNumber}>1</Text>
                <Section style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Finding Alternatives</Text>
                  <Text style={styles.stepText}>We're contacting other qualified {serviceType} suppliers in your area.</Text>
                </Section>
              </Section>

              <Section style={styles.stepItem}>
                <Text style={styles.stepNumber}>2</Text>
                <Section style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Same Service & Price</Text>
                  <Text style={styles.stepText}>Your new supplier will provide the same {serviceType} at the same price point.</Text>
                </Section>
              </Section>

              <Section style={styles.stepItem}>
                <Text style={styles.stepNumber}>3</Text>
                <Section style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Quick Confirmation</Text>
                  <Text style={styles.stepText}>We'll email you within 24 hours with your new supplier's details.</Text>
                </Section>
              </Section>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                View Booking Status
              </Button>
            </Section>

            {/* Help Box */}
            <Section style={styles.helpBox}>
              <Heading as="h4" style={styles.helpHeading}>Questions?</Heading>
              <Text style={styles.helpText}>
                Our team is here to help. Call us at <strong>0800 123 4567</strong> or reply to this email.
              </Text>
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
              You received this email because you booked a party through PartySnap.
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
    maxWidth: '680px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
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
  updateBanner: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
    margin: '0 0 20px 0',
  },
  messageBox: {
    backgroundColor: '#fffbeb',
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 25px 0',
    borderLeft: '4px solid #f59e0b',
  },
  messageHeading: {
    color: '#92400e',
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
  stepsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '0 0 25px 0',
  },
  stepsHeading: {
    color: '#1f2937',
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  stepItem: {
    marginBottom: '15px',
  },
  stepNumber: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    backgroundColor: '#FC6B57',
    color: 'white',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '24px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '12px',
    verticalAlign: 'top',
  },
  stepContent: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: 'calc(100% - 40px)',
  },
  stepTitle: {
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  stepText: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '1.5',
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
  helpBox: {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '15px 20px',
    margin: '0 0 25px 0',
  },
  helpHeading: {
    color: '#1d4ed8',
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '600',
  },
  helpText: {
    color: '#1e40af',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
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
