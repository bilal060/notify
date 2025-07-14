# Mobile Data Collection Frontend

A comprehensive React frontend for monitoring and managing mobile data collection, including notifications, emails, SMS, call logs, contacts, and device information.

## Features

### Main Dashboard
- **Device Overview**: View all connected mobile devices
- **Real-time Statistics**: Monitor notifications, media files, and installed apps
- **Device Details**: Access detailed information about each device

### Admin Dashboard
Access the admin dashboard at `/admin` to view comprehensive data management:

#### 📊 Admin Overview (`/admin`)
- **Statistics Dashboard**: Overview of all collected data
- **Quick Actions**: Direct links to all data views
- **Real-time Counts**: Live statistics for all data types

#### 📱 Devices Management (`/admin/devices`)
- **Device List**: All registered devices with detailed information
- **Device Details**: Manufacturer, model, Android version, SDK version
- **Installed Apps**: Complete list of apps on each device
- **Status Monitoring**: Active/inactive device status
- **Search & Filter**: Find devices by ID, manufacturer, or model

#### 👥 Users Management (`/admin/users`)
- **User Profiles**: Complete user information and metadata
- **Password Access**: View stored passwords from metadata
- **Device Association**: Link users to their devices
- **Activity Tracking**: Last login and activity timestamps
- **Monitor URLs**: Direct links to user monitoring pages

#### 🔔 Notifications Management (`/admin/notifications`)
- **Notification History**: All collected notifications from devices
- **App Filtering**: Filter by app name, package name, or category
- **Read Status**: Track read/unread notifications
- **Detailed View**: Full notification content and metadata
- **Device Association**: Link notifications to specific devices

#### 📧 Emails Management (`/admin/emails`)
- **Gmail Integration**: All emails from connected Gmail accounts
- **Account Filtering**: Filter emails by Gmail account
- **Email Content**: Full email body, attachments, and metadata
- **Status Tracking**: Read, starred, and important status
- **Search Functionality**: Search by sender, subject, or content

#### 💬 SMS Management (`/admin/sms`)
- **SMS History**: All SMS messages from devices
- **Type Filtering**: Inbox, sent, draft, failed messages
- **Contact Association**: Link SMS to phone numbers
- **Message Content**: Full SMS body and metadata
- **Device Tracking**: Associate SMS with specific devices

#### 📞 Call Logs Management (`/admin/call-logs`)
- **Call History**: All call logs from devices
- **Call Types**: Incoming, outgoing, missed, rejected calls
- **Duration Tracking**: Call duration and timestamps
- **Contact Names**: Associated contact information
- **Device Association**: Link calls to specific devices

#### 👤 Contacts Management (`/admin/contacts`)
- **Contact List**: All contacts from devices
- **Contact Details**: Names, phone numbers, email addresses
- **Device Association**: Link contacts to specific devices
- **Search Functionality**: Find contacts by name or number

#### 📮 Gmail Accounts Management (`/admin/gmail-accounts`)
- **Account Overview**: All connected Gmail accounts
- **Access Tokens**: Monitor OAuth token status
- **Sync Information**: Last sync time and status
- **Account Management**: Delete accounts and manage access
- **Email Statistics**: Total emails per account

## API Endpoints

### Admin Statistics
- `GET /api/admin/stats` - Get overall statistics

### Data Management
- `GET /api/users` - Get users with pagination
- `GET /api/devices` - Get devices with pagination
- `GET /api/notifications` - Get notifications with pagination
- `GET /api/gmail/emails` - Get emails with pagination
- `GET /api/sms` - Get SMS with pagination
- `GET /api/callLogs` - Get call logs with pagination
- `GET /api/contacts` - Get contacts with pagination
- `GET /api/gmail/accounts` - Get Gmail accounts with pagination

## Features

### 🔍 Search & Filter
- **Real-time Search**: Search across all data types
- **Advanced Filtering**: Filter by status, type, category, or date
- **Pagination**: Handle large datasets efficiently

### 📊 Data Visualization
- **Statistics Cards**: Overview of data counts
- **Status Badges**: Visual indicators for data status
- **Progress Tracking**: Monitor data collection progress

### 🔐 Security
- **Protected Routes**: Admin access control
- **Data Privacy**: Secure handling of sensitive information
- **Audit Trail**: Track all data access and modifications

### 📱 Responsive Design
- **Mobile-Friendly**: Works on all device sizes
- **Modern UI**: Clean, professional interface
- **Accessibility**: Screen reader and keyboard navigation support

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access the Application**:
   - Main Dashboard: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/admin`

## Navigation

### Main Dashboard
- **Dashboard**: Overview of connected devices
- **Notifications**: View all notifications
- **Media**: View all media files
- **Admin Dashboard**: Access comprehensive admin panel

### Admin Dashboard
- **Overview**: Statistics and quick actions
- **Devices**: Manage all devices
- **Users**: Manage all users
- **Notifications**: Manage all notifications
- **Emails**: Manage all emails
- **SMS**: Manage all SMS messages
- **Call Logs**: Manage all call logs
- **Contacts**: Manage all contacts
- **Gmail Accounts**: Manage all Gmail accounts

## Data Privacy

This application is designed for legitimate data collection and monitoring purposes. All data is stored securely and access is controlled through proper authentication and authorization mechanisms.

## Support

For technical support or questions about the admin dashboard, please refer to the backend documentation or contact the development team.
