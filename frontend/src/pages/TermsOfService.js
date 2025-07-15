import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this application, you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Our application provides notification monitoring and Gmail data collection services. The service includes:
          </p>
          <ul>
            <li>Background notification monitoring and collection</li>
            <li>Gmail account integration and email forwarding</li>
            <li>Device information tracking</li>
            <li>Admin dashboard for data management</li>
            <li>API endpoints for data access</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts and Registration</h2>
          <h3>3.1 Account Creation</h3>
          <ul>
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>You must be at least 18 years old to create an account</li>
          </ul>

          <h3>3.2 Account Responsibilities</h3>
          <ul>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must not share your account credentials with others</li>
            <li>You must not use the service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section>
          <h2>4. Permissions and Consent</h2>
          <h3>4.1 Notification Access</h3>
          <ul>
            <li>You must grant notification access permissions in your device settings</li>
            <li>This permission allows us to collect notification data from your device</li>
            <li>You can revoke this permission at any time through device settings</li>
          </ul>

          <h3>4.2 Gmail Access</h3>
          <ul>
            <li>Gmail integration requires explicit consent and OAuth authorization</li>
            <li>You must have the legal right to access the Gmail account you connect</li>
            <li>You can disconnect Gmail access at any time through the application</li>
          </ul>
        </section>

        <section>
          <h2>5. Acceptable Use Policy</h2>
          <p>You agree not to use the service to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Use the service for commercial purposes without authorization</li>
            <li>Collect data from third parties without their consent</li>
          </ul>
        </section>

        <section>
          <h2>6. Data and Privacy</h2>
          <ul>
            <li>Your use of the service is also governed by our Privacy Policy</li>
            <li>We collect and process data as described in our Privacy Policy</li>
            <li>You are responsible for ensuring you have the right to share any data you provide</li>
            <li>We implement appropriate security measures to protect your data</li>
          </ul>
        </section>

        <section>
          <h2>7. Service Availability</h2>
          <ul>
            <li>We strive to maintain high service availability but cannot guarantee 100% uptime</li>
            <li>We may perform maintenance that temporarily affects service availability</li>
            <li>We are not liable for any damages caused by service interruptions</li>
            <li>We reserve the right to modify or discontinue the service with notice</li>
          </ul>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <ul>
            <li>The service and its original content, features, and functionality are owned by us</li>
            <li>You retain ownership of any data you provide to the service</li>
            <li>You grant us a license to use your data to provide the service</li>
            <li>You may not copy, modify, or distribute our intellectual property</li>
          </ul>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless our company and its officers, directors, 
            employees, and agents from and against any claims, damages, obligations, losses, liabilities, 
            costs, or debt arising from your use of the service.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <h3>11.1 Termination by You</h3>
          <ul>
            <li>You may terminate your account at any time</li>
            <li>Upon termination, your data will be deleted according to our data retention policy</li>
            <li>Some data may be retained for legal or regulatory purposes</li>
          </ul>

          <h3>11.2 Termination by Us</h3>
          <ul>
            <li>We may terminate or suspend your account for violations of these terms</li>
            <li>We will provide reasonable notice before termination except in cases of serious violations</li>
            <li>Termination does not affect any accrued rights or obligations</li>
          </ul>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>13. Dispute Resolution</h2>
          <ul>
            <li>Any disputes arising from these terms will be resolved through binding arbitration</li>
            <li>Arbitration will be conducted in accordance with [Arbitration Rules]</li>
            <li>You waive your right to a jury trial or class action lawsuit</li>
          </ul>
        </section>

        <section>
          <h2>14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material 
            changes by posting the new terms on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>15. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <ul>
            <li>Email: legal@yourcompany.com</li>
            <li>Address: [Your Company Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>
        </section>

        <div className="legal-navigation">
          <Link to="/privacy" className="nav-link">Privacy Policy</Link>
          <Link to="/" className="nav-link">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 