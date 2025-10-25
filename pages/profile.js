import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, updateProfile, uploadAvatar, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || ''
      });
      // Clear preview when profile updates with new avatar
      if (profile.avatar_url && previewImage) {
        setTimeout(() => setPreviewImage(null), 100);
      }
    }
  }, [profile, previewImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        setPreviewImage(base64Image);
        
        // Update profile with base64 image
        const updateResult = await updateProfile({ avatar_url: base64Image });
        
        if (updateResult.error) {
          alert('Error updating profile: ' + updateResult.error.message);
          setPreviewImage(null);
        } else {
          // Image successfully saved to database
          console.log('Avatar saved to database successfully');
        }
        setUploading(false);
      };
      
      reader.onerror = () => {
        alert('Error reading file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error processing image: ' + error.message);
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... • Profile</title>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000000',
          color: '#ffffff'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #3a3a3a',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Profile • Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/css/conversational-chatbot.webflow.shared.c3f87610b.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="/images/app-icon.png" rel="apple-touch-icon" />
      </Head>


      

      <main className="container">
        <div className="header">
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
          <h1 className="title">Profile Settings</h1>
        </div>
        
        <div className="profile-body">
          <div className="avatar-section">
            <div className="avatar">
              {previewImage ? (
                <img src={previewImage} alt="Avatar Preview" className="avatar-image" />
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-initial">
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleAvatarUpload}
              className="avatar-upload"
              id="avatar-upload"
              multiple={false}
            />
            <label htmlFor="avatar-upload">
              <button
                type="button"
                className="avatar-button"
                disabled={uploading}
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                {uploading ? 'Uploading...' : 'Change Avatar'}
              </button>
            </label>
          </div>

          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {profile?.username || formData.username || 'Not set'}</p>
          </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="Enter your username"
              />
            </div>

           

            <div className="button-group">
              {!editing ? (
                <>
                  <button
                    className="button primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="button"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: profile?.username || '',
                        full_name: profile?.full_name || ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
        </div>
      </main>

      <style jsx global>{`
        /* Base and theme */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000000; color: #ffffff; min-height: 100vh; }
        img, video, canvas { max-width: 100%; height: auto; }
        .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }

        /* Top Navigation */
        .site-nav { position: sticky; top: 0; z-index: 40; background: inherit; padding: 12px 20px; }
        .site-nav_inner { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
        .site-nav_brand { font-family: "Fjalla One", sans-serif; font-size: 1.125rem; letter-spacing: 0.02em; color: #7a7a7a; text-decoration: none; }
        .site-nav_links { display: flex; gap: 16px; }
        .site-nav_link { font-family: "Source Sans 3", sans-serif; color: #7a7a7a; text-decoration: none; font-size: 0.975rem; }
        .site-nav_link:hover, .site-nav_brand:hover { color: #5f5f5f; }

        /* Header */
        .header { text-align: center; padding: 16px 20px 40px; position: relative; }
        .title { font-family: "Fjalla One", sans-serif; font-size: clamp(2rem, 6vw, 3rem); margin: 0 0 8px; letter-spacing: 0.04em; color: #ffffff; }
        .back-button { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #7a7a7a; font-size: 24px; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.3s ease; font-family: "Source Sans 3", sans-serif; }
        .back-button:hover { color: #5f5f5f; }

        /* Profile Body */
        .profile-body { max-width: 600px; margin: 0 auto; padding: 0 20px; }
        
        .avatar-section { 
          text-align: center; 
          margin-bottom: 50px; 
          padding: 20px 0;
        }
        
        .avatar { 
          width: 180px !important; 
          height: 180px !important; 
          border-radius: 50%; 
          background: rgba(255,255,255,0.06); 
          margin: 0 auto 40px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 120px !important; 
          color: #ffffff; 
          overflow: hidden; 
          position: relative; 
          border: 4px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        
        .avatar-image { 
          width: 100% !important; 
          height: 100% !important; 
          object-fit: cover;
          object-position: center;
          border-radius: 50%;
        }
        
        .avatar-initial {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: inherit;
          color: inherit;
        }
        
        .avatar-upload { display: none; }
        
        .avatar-button { background: #1a1a1a; color: #cfcfcf; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 20px; font-family: "Source Sans 3", sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        
        .avatar-button:hover { background: #222; color: #fff; transform: translateY(-1px); }
        
        .avatar-button:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .user-info { text-align: center; margin-bottom: 40px; }
        
        .user-info p { margin: 12px 0; color: rgba(255,255,255,0.85); font-size: 18px; font-family: "Source Sans 3", sans-serif; }
        
        .user-info p strong { color: #ffffff; }
        
        .form-group { margin-bottom: 24px; }
        
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #ffffff; font-size: 14px; font-family: "Source Sans 3", sans-serif; }
        
        .form-group input { width: 100%; background: #0f0f0f; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; font-size: 1rem; font-family: "Source Sans 3", sans-serif; transition: all 0.2s ease; box-sizing: border-box; }
        
        .form-group input::placeholder { color: #8a8a8a; }
        
        .form-group input:focus { outline: none; border-color: rgba(255,255,255,0.2); background: #1a1a1a; }
        
        .form-group input:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .button-group { display: flex; gap: 12px; margin-top: 40px; }
        
        .button { flex: 1; background: #1a1a1a; color: #cfcfcf; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; font-family: "Source Sans 3", sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        
        .button.primary { background: #222; color: #fff; }
        
        .button:hover { background: #222; color: #fff; transform: translateY(-1px); }
        
        .button.primary:hover { background: #333; }
        
        .button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .loading-spinner { width: 60px; height: 60px; border: 4px solid #3a3a3a; border-top: 4px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 50px auto; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Responsive */
        @media (max-width: 767px) {
          .container { padding: 20px 15px; }
          .profile-body { padding: 0 15px; }
          .button-group { flex-direction: column; }
          .back-button { left: 15px; }
          .avatar { 
            width: 200px !important; 
            height: 200px !important; 
            font-size: 100px !important; 
          }
        }
      `}</style>
    </>
  );
}
