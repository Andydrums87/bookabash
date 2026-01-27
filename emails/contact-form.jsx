import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Hr,
} from '@react-email/components';

export default function ContactFormEmail({
  name = 'Unknown',
  email = 'No email provided',
  inquiryType = 'general',
  subject = 'No subject',
  message = 'No message',
}) {
  const inquiryLabels = {
    general: 'General Inquiry',
    support: 'Technical Support',
    booking: 'Booking Help',
    supplier: 'Become a Supplier',
    press: 'Press & Media',
    partnership: 'Partnership',
  };

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
            <Heading style={styles.headerTitle}>New Contact Form Submission</Heading>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.intro}>
              You've received a new message from the PartySnap website contact form.
            </Text>

            {/* Contact Details */}
            <Section style={styles.detailsBox}>
              <Heading as="h3" style={styles.sectionHeading}>Contact Details</Heading>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{name}</Text>
              </Section>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{email}</Text>
              </Section>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Inquiry Type:</Text>
                <Text style={styles.detailValue}>{inquiryLabels[inquiryType] || inquiryType}</Text>
              </Section>

              <Section style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject:</Text>
                <Text style={styles.detailValue}>{subject}</Text>
              </Section>
            </Section>

            <Hr style={styles.divider} />

            {/* Message */}
            <Section style={styles.messageBox}>
              <Heading as="h3" style={styles.sectionHeading}>Message</Heading>
              <Text style={styles.messageText}>{message}</Text>
            </Section>

            {/* Reply Prompt */}
            <Section style={styles.replyBox}>
              <Text style={styles.replyText}>
                Reply directly to this email to respond to {name} at {email}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This message was sent from the PartySnap contact form.
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
    background: 'linear-gradient(135deg, #FC6B57, #FF8A80)',
    color: 'white',
    padding: '30px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '120px',
    height: 'auto',
    margin: '0 auto 15px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: '30px',
    backgroundColor: '#FFFFFF',
  },
  intro: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  detailsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionHeading: {
    color: '#FC6B57',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  detailRow: {
    marginBottom: '12px',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  detailValue: {
    color: '#374151',
    fontSize: '16px',
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '25px 0',
  },
  messageBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  messageText: {
    color: '#374151',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  replyBox: {
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
  },
  replyText: {
    color: '#1e40af',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    padding: '20px',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '12px',
  },
};
