import React, { useState, useRef } from 'react';

const ShipperProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null); 
  
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'j.doe@cargozents.com',
    phone: '+1 (555) 234-5678',
    companyName: 'Logix Global Shipping Ltd',
    title: 'Logistics Manager',
    dotNumber: 'DOT3829102',
    einNumber: '12-3456789',
    insuranceLimit: '$500,000',
    address: '1044 Freight Way, Suite 200',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60609',
    country: 'United States'
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    delayWarnings: true,
    autoInvoice: true,
    currency: 'USD',
    unitSystem: 'Imperial (lbs, miles)',
    twoFactorAuth: false
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingToggle = (settingName) => {
    setSettings(prev => ({ ...prev, [settingName]: !prev[settingName] }));
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="shipper-profile-container">
      <style>{`
        .shipper-profile-container {
          --primary-color: #ffffff;
          --accent-color: #00E676;
          --accent-hover: #00c565;
          --bg-main: #050c08;
          --bg-card: #0a1811;
          --border-color: #173022;
          --text-main: #f8fafc;
          --text-muted: #9ca3af;
          --success-color: #00E676;

          max-width: 1000px;
          margin: 30px auto;
          padding: 0 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--text-main);
        }

        .profile-hero-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .profile-hero-main {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .avatar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          background-color: #173022;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          text-transform: uppercase;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid var(--border-color);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(5, 12, 8, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .avatar-overlay span {
          color: var(--accent-color);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .avatar-placeholder:hover .avatar-overlay {
          opacity: 1;
        }

        .badge-verified {
          font-size: 11px;
          background-color: rgba(0, 230, 118, 0.1);
          color: var(--success-color);
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid rgba(0, 230, 118, 0.2);
        }

        .hero-info h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          color: var(--primary-color);
        }

        .company-subtitle {
          margin: 0 0 6px 0;
          color: var(--text-muted);
          font-size: 15px;
        }

        .shipper-id {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .mono {
          font-family: monospace;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--accent-color);
        }

        .profile-stats-grid {
          display: flex;
          gap: 16px;
        }

        .stat-card {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 16px 20px;
          border-radius: 8px;
          min-width: 110px;
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .text-green {
          color: var(--success-color);
        }

        .profile-tabs-nav {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          margin-top: 30px;
          gap: 8px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: var(--accent-color);
        }

        .tab-btn.active {
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }

        .tab-content-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 12px 12px;
          padding: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-header h3, .settings-section h3 {
          margin: 0;
          font-size: 18px;
          color: var(--primary-color);
        }

        .section-desc {
          margin: 4px 0 20px 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .profile-form h3 {
          margin: 0 0 20px 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.span-2 {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          background-color: var(--bg-main);
          color: var(--text-main);
          transition: border-color 0.15s ease;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .form-group input:disabled, .form-group select:disabled {
          background-color: rgba(23, 48, 34, 0.3);
          color: var(--text-muted);
          cursor: not-allowed;
          border-color: rgba(23, 48, 34, 0.5);
        }

        .divider {
          border: 0;
          height: 1px;
          background: var(--border-color);
          margin: 30px 0;
        }

        .btn-primary {
          background-color: var(--accent-color);
          color: #050c08;
          border: none;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-primary:hover {
          background-color: var(--accent-hover);
        }

        .btn-secondary {
          background-color: transparent;
          color: var(--text-main);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background-color: var(--bg-main);
          border-color: var(--accent-color);
        }

        .btn-text {
          background: none;
          border: none;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          padding: 10px;
        }

        .btn-text:hover {
          color: var(--primary-color);
        }

        .form-actions-top {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .toggle-control-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .toggle-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .toggle-desc {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        input[type="checkbox"].switch {
          appearance: none;
          -webkit-appearance: none;
          width: 44px;
          height: 24px;
          background-color: #173022;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          outline: none;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }

        input[type="checkbox"].switch:checked {
          background-color: var(--success-color);
        }

        input[type="checkbox"].switch::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background-color: #ffffff;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        input[type="checkbox"].switch:checked::before {
          transform: translateX(20px);
        }

        .session-table-container {
          overflow-x: auto;
        }

        .session-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .session-table th {
          padding: 12px;
          border-bottom: 2px solid var(--border-color);
          color: var(--text-muted);
          font-weight: 600;
        }

        .session-table td {
          padding: 14px 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .badge-active {
          color: var(--success-color);
          background: rgba(0, 230, 118, 0.1);
          padding: 2px 8px;
          font-size: 12px;
          border-radius: 4px;
          font-weight: 600;
          border: 1px solid rgba(0, 230, 118, 0.2);
        }

        .badge-offline {
          color: var(--text-muted);
          background: var(--bg-main);
          padding: 2px 8px;
          font-size: 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .profile-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .profile-stats-grid {
            width: 100%;
            justify-content: space-between;
          }
          .form-group.span-2 {
            grid-column: span 1;
          }
        }
      `}</style>

      <div className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="avatar-container">
            <div className="avatar-placeholder" onClick={handleAvatarClick} title="Click to upload profile image">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="avatar-img" />
              ) : (
                <>{profileData.firstName[0]}{profileData.lastName[0]}</>
              )}
              <div className="avatar-overlay">
                <span>Change</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            
            <span className="badge-verified">✓ Verified Shipper</span>
          </div>
          
          <div className="hero-info">
            <h2>{profileData.firstName} {profileData.lastName}</h2>
            <p className="company-subtitle">{profileData.companyName} • {profileData.title}</p>
            <p className="shipper-id">Account ID: <span className="mono">CZ-98412</span></p>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Active Shipments</span>
            <span className="stat-value">14</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Completed</span>
            <span className="stat-value">1,248</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">On-Time Rate</span>
            <span className="stat-value text-green">98.4%</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Company & Personal Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Shipping Preferences & Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security & Access
        </button>
      </div>

      <div className="tab-content-wrapper">
        
        {activeTab === 'profile' && (
          <form onSubmit={saveProfile} className="profile-form">
            <div className="form-header">
              <h3>Account Credentials</h3>
              {!isEditing ? (
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              ) : (
                <div className="form-actions-top">
                  <button type="button" className="btn-text" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
            </div>

            <hr className="divider" />
            <h3>Logistics & Regulatory Data</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Registered Company Name</label>
                <input type="text" name="companyName" value={profileData.companyName} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>DOT Number</label>
                <input type="text" name="dotNumber" value={profileData.dotNumber} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>EIN / Tax ID</label>
                <input type="text" name="einNumber" value={profileData.einNumber} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Cargo Insurance Limit</label>
                <input type="text" name="insuranceLimit" value={profileData.insuranceLimit} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
            </div>

            <hr className="divider" />
            <h3>Operating Address</h3>
            
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Street Address</label>
                <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>State / Province</label>
                <input type="text" name="state" value={profileData.state} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Zip / Postal Code</label>
                <input type="text" name="zipCode" value={profileData.zipCode} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={profileData.country} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
            </div>
          </form>
        )}

        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="settings-section">
              <h3>Notification Dispatch Settings</h3>
              <p className="section-desc">Manage how you receive load updates, routing adjustments, and tracking data.</p>
              
              <div className="toggle-control-group">
                <div className="toggle-row">
                  <div>
                    <label className="toggle-title">Email Dispatch Alerts</label>
                    <p className="toggle-desc">Receive immediate notifications when a driver accepts or completes a shipment.</p>
                  </div>
                  <input type="checkbox" className="switch" checked={settings.emailNotifications} onChange={() => handleSettingToggle('emailNotifications')} />
                </div>

                <div className="toggle-row">
                  <div>
                    <label className="toggle-title">SMS / Text Tracking Updates</label>
                    <p className="toggle-desc">Get key location updates pushed directly via text message to your phone.</p>
                  </div>
                  <input type="checkbox" className="switch" checked={settings.smsAlerts} onChange={() => handleSettingToggle('smsAlerts')} />
                </div>

                <div className="toggle-row">
                  <div>
                    <label className="toggle-title">Critical Delay & Route Warnings</label>
                    <p className="toggle-desc">Receive real-time automated warnings if an active load runs into detention or delays.</p>
                  </div>
                  <input type="checkbox" className="switch" checked={settings.delayWarnings} onChange={() => handleSettingToggle('delayWarnings')} />
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div className="settings-section">
              <h3>Platform Regional Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Default Currency Unit</label>
                  <select name="currency" value={settings.currency} onChange={handleSettingChange}>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Measurement Metrics</label>
                  <select name="unitSystem" value={settings.unitSystem} onChange={handleSettingChange}>
                    <option value="Imperial (lbs, miles)">Imperial (lbs, miles)</option>
                    <option value="Metric (kgs, kms)">Metric (kgs, kms)</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div className="settings-section">
              <h3>Billing & Automation Preferences</h3>
              <div className="toggle-row">
                <div>
                  <label className="toggle-title">Automated Invoicing</label>
                  <p className="toggle-desc">Automatically process and clear digital bills of lading (BOL) upon delivery verification.</p>
                </div>
                <input type="checkbox" className="switch" checked={settings.autoInvoice} onChange={() => handleSettingToggle('autoInvoice')} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-panel">
            <div className="settings-section">
              <h3>Change Account Password</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <button type="button" className="btn-primary" style={{marginTop: '15px'}}>Update Password</button>
            </div>

            <hr className="divider" />

            <div className="settings-section">
              <h3>Multi-Factor Authentication</h3>
              <div className="toggle-row">
                <div>
                  <label className="toggle-title">Two-Factor Authentication (2FA)</label>
                  <p className="toggle-desc">Secure your load assignments and financial details with an extra layer of mobile verification.</p>
                </div>
                <input type="checkbox" className="switch" checked={settings.twoFactorAuth} onChange={() => handleSettingToggle('twoFactorAuth')} />
              </div>
            </div>

            <hr className="divider" />

            <div className="settings-section">
              <h3>Authorized Device Sessions</h3>
              <div className="session-table-container">
                <table className="session-table">
                  <thead>
                    <tr>
                      <th>Device / Browser</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Chrome (MacBook Pro)</td>
                      <td>Chicago, IL</td>
                      <td><span className="badge-active">Active Now</span></td>
                    </tr>
                    <tr>
                      <td>Safari (iPhone 15)</td>
                      <td>Atlanta, GA</td>
                      <td><span className="badge-offline">2 days ago</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShipperProfile;