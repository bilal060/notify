import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy describes how we collect, use, and protect your information when you use our application. 
            By using our service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Device Information</h3>
          <ul>
            <li>Device ID and model</li>
            <li>Operating system version</li>
            <li>App version and installation details</li>
            <li>Network connectivity information</li>
          </ul>

          <h3>2.2 Notification Data</h3>
          <ul>
            <li>App package names that generate notifications</li>
            <li>Notification content and metadata</li>
            <li>Timestamp of notifications</li>
            <li>Notification categories and types</li>
          </ul>

          <h3>2.3 Gmail Data (with explicit consent)</h3>
          <ul>
            <li>Email addresses and account information</li>
            <li>Email content and metadata</li>
            <li>Email forwarding preferences</li>
            <li>Gmail API access tokens (encrypted)</li>
          </ul>

          <h3>2.4 User Account Information</h3>
          <ul>
            <li>Email address and password (encrypted)</li>
            <li>User preferences and settings</li>
            <li>Login history and session data</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To process and forward emails as requested</li>
            <li>To analyze usage patterns and improve our service</li>
            <li>To provide customer support</li>
            <li>To ensure security and prevent fraud</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <ul>
            <li>All data is stored securely in MongoDB databases</li>
            <li>Passwords are encrypted using bcrypt hashing</li>
            <li>API tokens and sensitive data are encrypted at rest</li>
            <li>Data transmission is secured using HTTPS/TLS</li>
            <li>Regular security audits and updates are performed</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <ul>
            <li>Notification data: Retained for 30 days by default</li>
            <li>Email data: Retained until account deletion</li>
            <li>User account data: Retained until account deletion</li>
            <li>Device information: Retained for 90 days</li>
            <li>Logs and analytics: Retained for 1 year</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Export your data in a standard format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
          </ul>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>
            We may use third-party services for:
          </p>
          <ul>
            <li>Hosting and infrastructure (Render, Vercel)</li>
            <li>Database services (MongoDB Atlas)</li>
            <li>Email services (Gmail API)</li>
            <li>Analytics and monitoring</li>
          </ul>
          <p>
            These services have their own privacy policies and data handling practices.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe 
            your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@yourcompany.com</li>
            <li>Address: [Your Company Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>
        </section>

        <div className="legal-navigation">
          <Link to="/terms" className="nav-link">Terms of Service</Link>
          <Link to="/" className="nav-link">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 