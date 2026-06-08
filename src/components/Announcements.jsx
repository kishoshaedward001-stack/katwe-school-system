import React, { useState, useEffect } from 'react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'medium',
        imageUrl: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

    useEffect(() => {
        fetchAnnouncements();
        // Get user role from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_URL}/announcements`);
            const data = await response.json();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImage = new FormData();
        formDataImage.append('image', file);

        setUploadingImage(true);
        try {
            const response = await fetch(`${API_URL}/upload-announcement-image`, {
                method: 'POST',
                body: formDataImage
            });
            const data = await response.json();
            if (data.success) {
                setFormData({ ...formData, imageUrl: data.imageUrl });
                alert('✅ Picha imepakiwa!');
            }
        } catch (error) {
            alert('❌ Imeshindwa kupakia picha');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Tafadhali jaza kichwa na maelezo');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const url = editingId ? `${API_URL}/announcements/${editingId}` : `${API_URL}/announcements`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    author: user.fullName || user.username || 'Admin'
                })
            });

            if (response.ok) {
                alert(editingId ? '✅ Tangazo limebadilishwa!' : '✅ Tangazo limeongezwa!');
                fetchAnnouncements();
                setShowForm(false);
                setFormData({ title: '', content: '', priority: 'medium', imageUrl: '' });
                setEditingId(null);
            } else {
                alert('❌ Imeshindwa kuhifadhi tangazo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Kuna tatizo, jaribu tena');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Je, una uhakika unataka kufuta tangazo hili?')) {
            try {
                const response = await fetch(`${API_URL}/announcements/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('✅ Tangazo limefutwa!');
                    fetchAnnouncements();
                }
            } catch (error) {
                alert('❌ Imeshindwa kufuta');
            }
        }
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority || 'medium',
            imageUrl: announcement.imageUrl || ''
        });
        setEditingId(announcement.id);
        setShowForm(true);
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return '#dc2626';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'Muhimu Sana';
            case 'medium': return 'Muhimu';
            case 'low': return 'Kawaida';
            default: return priority;
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Inapakia matangazo...</p>
            </div>
        );
    }

    return (
        <div className="announcements-container">
            <div className="announcements-header">
                <h2><i className="fas fa-bullhorn"></i> Matangazo ya Shule</h2>
                {userRole === 'admin' && (
                    <button onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ title: '', content: '', priority: 'medium', imageUrl: '' });
                    }} className="btn btn-primary">
                        <i className="fas fa-plus"></i> Tangaza Jipya
                    </button>
                )}
            </div>

            {/* Form ya kuongeza tangazo */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingId ? 'Badilisha Tangazo' : 'Tangaza Jipya'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Kichwa cha Tangazo *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Picha (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <p>Inapakia picha...</p>}
                                {formData.imageUrl && (
                                    <div className="image-preview">
                                        <img src={formData.imageUrl} alt="Preview" />
                                        <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})}>
                                            Futa Picha
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Maelezo *</label>
                                <textarea
                                    rows="4"
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kiwango cha Umuhimu</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="low">Kawaida</option>
                                    <option value="medium">Muhimu</option>
                                    <option value="high">Muhimu Sana</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Hifadhi</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Ghairi</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Orodha ya Matangazo */}
            <div className="announcements-list">
                {announcements.length === 0 ? (
                    <div className="no-announcements">
                        <i className="fas fa-info-circle"></i>
                        <p>Hakuna matangazo kwa sasa</p>
                    </div>
                ) : (
                    announcements.map(announcement => (
                        <div key={announcement.id} className={`announcement-card priority-${announcement.priority}`}>
                            {announcement.imageUrl && (
                                <div className="announcement-image">
                                    <img src={announcement.imageUrl} alt={announcement.title} />
                                </div>
                            )}
                            <div className="announcement-content">
                                <div className="announcement-header">
                                    <div className="announcement-title">
                                        <span 
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                                        >
                                            {getPriorityText(announcement.priority)}
                                        </span>
                                        <h3>{announcement.title}</h3>
                                    </div>
                                    {userRole === 'admin' && (
                                        <div className="announcement-actions">
                                            <button onClick={() => handleEdit(announcement)} className="btn-edit">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(announcement.id)} className="btn-delete">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p>{announcement.content}</p>
                                <div className="announcement-footer">
                                    <span className="announcement-author">
                                        <i className="fas fa-user"></i> {announcement.author || 'Admin'}
                                    </span>
                                    <span className="announcement-date">
                                        <i className="fas fa-calendar"></i> {new Date(announcement.createdAt).toLocaleDateString('sw-TZ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Announcements;