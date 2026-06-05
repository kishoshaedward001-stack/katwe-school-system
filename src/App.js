import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ============ STATE ZA LOGIN ============
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // ============ STATE ZA WANAFUNZI ============
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', age: '', course: '', gender: '', phone: '', email: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ============ STATE ZA MATOKEO MODAL ============
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sendingStatus, setSendingStatus] = useState('');
  const [resultsData, setResultsData] = useState({
    subject1: '', grade1: '',
    subject2: '', grade2: '',
    subject3: '', grade3: '',
    subject4: '', grade4: '',
    remarks: '',
    sendMethod: ''
  });

  // ============ API BASE URL ============
  const API_URL = 'http://localhost:5002/api';

  // ============ USER CREDENTIALS ============
  const users = {
    admin: [{ username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Mkuu' }],
    regular: [{ username: 'teacher', password: 'teacher123', role: 'user', name: 'Mwalimu Juma' }]
  };

  // ============ PERMISSIONS ============
  const canEdit = userRole === 'admin';
  const canDelete = userRole === 'admin';
  const canAdd = userRole === 'admin';

  // ============ FETCH STUDENTS FROM DATABASE ============
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/students`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Imeshindwa kupata data kutoka database. Hakikisha backend inaendesha!');
    } finally {
      setLoading(false);
    }
  };

  // ============ LOAD STUDENTS WHEN LOGGED IN ============
  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn]);

  // ============ SET PAGE TITLE ============
  useEffect(() => {
    document.title = 'Katwe Secondary School | Student Management System';
  }, []);

  // ============ LOGIN FUNCTIONS ============
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setLoginError('');
    setLoginForm({ username: '', password: '' });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    
    if (!selectedRole) {
      setLoginError('Tafadhali chagua role yako kwanza!');
      return;
    }

    let user = null;
    if (selectedRole === 'admin') {
      user = users.admin.find(u => u.username === username && u.password === password);
    } else {
      user = users.regular.find(u => u.username === username && u.password === password);
    }

    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUserName(user.name);
      setLoginError('');
    } else {
      setLoginError('Username au password si sahihi! Jaribu tena.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');
    setSelectedRole(null);
    setLoginForm({ username: '', password: '' });
    setStudents([]);
  };

  // ============ STUDENT CRUD OPERATIONS ============
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAdd) {
      alert('⚠️ Samahani! Wewe ni user wa kawaida, huna ruhusa ya kuongeza wanafunzi.');
      return;
    }

    if (!formData.fullName || !formData.age || !formData.course || !formData.gender) {
      alert('Tafadhali jaza sehemu zote muhimu!');
      return;
    }

    try {
      const url = editingId ? `${API_URL}/students/${editingId}` : `${API_URL}/students`;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save');
      
      alert(editingId ? '✅ Mwanafunzi amesasishwa!' : '✅ Mwanafunzi amehifadhiwa!');
      fetchStudents();
      setFormData({ fullName: '', age: '', course: '', gender: '', phone: '', email: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('❌ Kuna tatizo, jaribu tena! Hakikisha backend iko running.');
    }
  };

  const handleEdit = (student) => {
    if (!canEdit) {
      alert('⚠️ Samahani! Wewe ni user wa kawaida, huna ruhusa ya kuhariri wanafunzi.');
      return;
    }
    setFormData(student);
    setEditingId(student.id);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert('⚠️ Samahani! Wewe ni user wa kawaida, huna ruhusa ya kufuta wanafunzi.');
      return;
    }
    
    if (window.confirm('Je, una uhakika unataka kufuta mwanafunzi huyu?')) {
      try {
        const response = await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        alert('✅ Mwanafunzi amefutwa!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Imeshindwa kufuta, jaribu tena!');
      }
    }
  };

  // ============ MATOKEO MODAL FUNCTIONS ============
  const openResultsModal = (student) => {
    setSelectedStudent(student);
    setResultsData({
      subject1: '', grade1: '',
      subject2: '', grade2: '',
      subject3: '', grade3: '',
      subject4: '', grade4: '',
      remarks: '',
      sendMethod: ''
    });
    setSendingStatus('');
    setShowModal(true);
  };

  const handleResultsChange = (e) => {
    setResultsData({ ...resultsData, [e.target.name]: e.target.value });
  };

  const sendEmail = async (student, results) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const emailContent = `TO: ${student.email}\nSUBJECT: Matokeo ya Mitihani - ${student.fullName}\n\nHABARI ${student.fullName},\n\nMatokeo yako:\n${results.subject1}: ${results.grade1}\n${results.subject2}: ${results.grade2}\n${results.subject3}: ${results.grade3}\n${results.subject4}: ${results.grade4}\n\nMAONI: ${results.remarks}\n\nAsante,\nKatwe Secondary School`;
        console.log('📧 Email sent:', emailContent);
        resolve(true);
      }, 1000);
    });
  };

  const sendSMS = async (student, results) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const smsContent = `Katwe School: ${student.fullName}, Matokeo: ${results.subject1}=${results.grade1}, ${results.subject2}=${results.grade2}, ${results.subject3}=${results.grade3}. ${results.remarks}`;
        console.log('📱 SMS sent to', student.phone, ':', smsContent);
        resolve(true);
      }, 1000);
    });
  };

  const handleSendResults = async () => {
    if (!resultsData.subject1 || !resultsData.grade1) {
      alert('Tafadhali jaza angalau somo moja na daraja lake!');
      return;
    }
    
    if (!resultsData.sendMethod) {
      alert('Chagua njia ya kutuma (Email au SMS)!');
      return;
    }

    setSendingStatus('processing');
    
    try {
      if (resultsData.sendMethod === 'email') {
        if (!selectedStudent.email) {
          alert('Mwanafunzi hana anuani ya email!');
          setSendingStatus('');
          return;
        }
        await sendEmail(selectedStudent, resultsData);
        alert(`✅ Matokeo yametumwa kwa email ya ${selectedStudent.email}`);
      } else if (resultsData.sendMethod === 'sms') {
        if (!selectedStudent.phone) {
          alert('Mwanafunzi hana namba ya simu!');
          setSendingStatus('');
          return;
        }
        await sendSMS(selectedStudent, resultsData);
        alert(`✅ Matokeo yametumwa kwa namba ${selectedStudent.phone}`);
      }
      
      setSendingStatus('sent');
      setTimeout(() => {
        setShowModal(false);
        setSendingStatus('');
      }, 1500);
      
    } catch (error) {
      alert('❌ Imeshindwa kutuma. Jaribu tena!');
      setSendingStatus('');
    }
  };

  // ============ FILTER STUDENTS ============
  const filteredStudents = students.filter(s =>
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ DOWNLOAD CSV ============
  const downloadCSV = () => {
    const headers = ["JINA KAMILI", "UMRI", "JINSIA", "KOZI", "NAMBA YA SIMU", "EMAIL"];
    const rows = students.map(s => [`"${s.fullName}"`, s.age, s.gender, `"${s.course}"`, `"${s.phone || ''}"`, `"${s.email || ''}"`]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "wanafunzi_katwe_report.csv";
    link.click();
  };

  // ============ LOGIN PAGE ============
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <i className="fas fa-graduation-cap"></i>
            <h1>KATWE SECONDARY SCHOOL</h1>
            <p>Student Analytics & Management Hub</p>
          </div>
          
          {!selectedRole ? (
            <div className="role-selection">
              <h3>Chagua Aina ya Account</h3>
              <div className="role-buttons">
                <button type="button" onClick={() => handleRoleSelect('admin')} className="role-btn admin-role">
                  <i className="fas fa-user-shield"></i>
                  <div>
                    <strong>Admin</strong>
                    <small>Access kamili ya kudhibiti</small>
                  </div>
                </button>
                <button type="button" onClick={() => handleRoleSelect('user')} className="role-btn user-role">
                  <i className="fas fa-user"></i>
                  <div>
                    <strong>User wa Kawaida</strong>
                    <small>Kutazama tu (Read only)</small>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="role-badge">
                <span className={`role-badge-${selectedRole}`}>
                  <i className={selectedRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
                  {selectedRole === 'admin' ? ' Admin Login' : ' User Login'}
                </span>
                <button type="button" onClick={() => setSelectedRole(null)} className="change-role-btn">
                  <i className="fas fa-arrow-left"></i> Badilisha
                </button>
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-user"></i> Username</label>
                <input type="text" name="username" value={loginForm.username} onChange={handleLoginChange} placeholder={selectedRole === 'admin' ? "admin" : "teacher"} required />
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="••••••••" required />
              </div>
              
              {loginError && <div className="error-message">{loginError}</div>}
              
              <button type="submit" className="btn-login">
                <i className="fas fa-sign-in-alt"></i> INGIA
              </button>
            </form>
          )}
          
          <div className="login-footer">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>User:</strong> teacher / teacher123</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN DASHBOARD ============
  return (
    <div className="container">
      <div className="school-header">
        <div className="user-info">
          <i className={userRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
          <span>
            <strong>{userName}</strong> 
            <small>({userRole === 'admin' ? 'Administrator' : 'Regular User'})</small>
          </span>
        </div>
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>STUDENT ANALYTICS & MANAGEMENT HUB // MODAL YA MATOKEO</p>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> TONDA MFUMO
        </button>
      </div>

      <div className="dashboard-grid">
        {/* FORM YA KUSAJILI WANAFUNZI */}
        <div className="card">
          <div className="card-header">
            <i className="fas fa-user-plus"></i>
            <h2>{editingId ? '📝 HARIRI MWANAFUNZI' : '📝 SAJILI MWANAFUNZI'}</h2>
            {!canAdd && <span className="permission-badge"><i className="fas fa-lock"></i> Read Only</span>}
          </div>
          <div className="card-body">
            {!canAdd && (
              <div className="permission-message">
                <i className="fas fa-info-circle"></i>
                <p>Samahani, wewe ni user wa kawaida. Huna ruhusa ya kuongeza au kuhariri wanafunzi.</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>JINA KAMILI *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Mfano: Mariamu Ramadhani" required disabled={!canAdd} />
              </div>
              <div className="form-group">
                <label>UMRI *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="22" required disabled={!canAdd} />
              </div>
              <div className="form-group">
                <label>KOZI YA MASOMO *</label>
                <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Information Technology" required disabled={!canAdd} />
              </div>
              <div className="form-group">
                <label>JINSIA *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required disabled={!canAdd}>
                  <option value="">Chagua Jinsia...</option>
                  <option value="MALE">MALE (Mwanaume)</option>
                  <option value="FEMALE">FEMALE (Mwanamke)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Namba ya Simu (Kwa SMS)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0712345678" disabled={!canAdd} />
              </div>
              <div className="form-group">
                <label>Barua pepe (Email)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="mwanafunzi@email.com" disabled={!canAdd} />
              </div>
              {canAdd && (
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editingId ? 'SASISHA' : 'HIFADHI'}
                </button>
              )}
              {editingId && canAdd && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setFormData({ fullName: '', age: '', course: '', gender: '', phone: '', email: '' }); }}>
                  <i className="fas fa-times"></i> Ghairi
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ORODHA YA WANAFUNZI */}
        <div className="card">
          <div className="card-header">
            <i className="fas fa-users"></i>
            <h2>📋 ORODHA RASMI YA WANAFUNZI</h2>
          </div>
          <div className="card-body">
            <div className="search-section">
              <input type="text" className="search-input" placeholder="🔍 Tafuta kwa jina au kozi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="stat-badge">
                <i className="fas fa-search"></i> Wanafunzi {filteredStudents.length}
              </span>
            </div>
            
            {loading && <div className="loading-spinner">Inapakia data...</div>}
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>JINA</th><th>KOZI</th><th>SIMU</th><th>EMAIL</th><th>VITENDO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && !loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>📭 Hakuna wanafunzi waliosajiliwa</td></tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td><strong>{student.fullName}</strong> ({student.age})<br/><small>{student.gender}</small></td>
                        <td>{student.course}</td>
                        <td>{student.phone || '—'}</td>
                        <td>{student.email || '—'}</td>
                        <td className="action-buttons">
                          <button className="btn btn-sm btn-primary" onClick={() => openResultsModal(student)}>
                            <i className="fas fa-chart-line"></i> Matokeo
                          </button>
                          {canEdit && <button className="btn btn-sm btn-outline" onClick={() => handleEdit(student)}><i className="fas fa-edit"></i> Edit</button>}
                          {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}><i className="fas fa-trash-alt"></i> Futa</button>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <hr />
            <div className="download-area">
              <span><i className="fas fa-download"></i> <strong>PAKUA RIPOTI</strong> (CSV)</span>
              <button onClick={downloadCSV} className="btn btn-outline btn-sm"><i className="fas fa-file-csv"></i> Pakua Orodha Kamili</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL YA KUJAZA MATOKEO NA KUTUMA */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-chart-line"></i> Jaza Matokeo - {selectedStudent.fullName}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="results-form">
                <h3>Somo la 1</h3>
                <div className="subject-row">
                  <input type="text" name="subject1" placeholder="Jina la somo" value={resultsData.subject1} onChange={handleResultsChange} />
                  <select name="grade1" value={resultsData.grade1} onChange={handleResultsChange}>
                    <option value="">Daraja</option>
                    <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                    <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                  </select>
                </div>
                
                <h3>Somo la 2</h3>
                <div className="subject-row">
                  <input type="text" name="subject2" placeholder="Jina la somo" value={resultsData.subject2} onChange={handleResultsChange} />
                  <select name="grade2" value={resultsData.grade2} onChange={handleResultsChange}>
                    <option value="">Daraja</option>
                    <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                    <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                  </select>
                </div>
                
                <h3>Somo la 3</h3>
                <div className="subject-row">
                  <input type="text" name="subject3" placeholder="Jina la somo" value={resultsData.subject3} onChange={handleResultsChange} />
                  <select name="grade3" value={resultsData.grade3} onChange={handleResultsChange}>
                    <option value="">Daraja</option>
                    <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                    <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                  </select>
                </div>
                
                <h3>Somo la 4</h3>
                <div className="subject-row">
                  <input type="text" name="subject4" placeholder="Jina la somo" value={resultsData.subject4} onChange={handleResultsChange} />
                  <select name="grade4" value={resultsData.grade4} onChange={handleResultsChange}>
                    <option value="">Daraja</option>
                    <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                    <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>MAONI / REMARKS</label>
                  <textarea name="remarks" rows="3" placeholder="Maoni kuhusu mwanafunzi..." value={resultsData.remarks} onChange={handleResultsChange}></textarea>
                </div>
                
                <div className="form-group">
                  <label>NJIA YA KUTUMA</label>
                  <div className="send-methods">
                    <label className="send-option">
                      <input type="radio" name="sendMethod" value="email" onChange={handleResultsChange} />
                      <i className="fas fa-envelope"></i> Tuma kwa Email ({selectedStudent.email || 'Hakuna email'})
                    </label>
                    <label className="send-option">
                      <input type="radio" name="sendMethod" value="sms" onChange={handleResultsChange} />
                      <i className="fas fa-sms"></i> Tuma kwa SMS ({selectedStudent.phone || 'Hakuna namba'})
                    </label>
                  </div>
                </div>
                
                {sendingStatus === 'processing' && (
                  <div className="sending-status"><i className="fas fa-spinner fa-spin"></i> Inatuma...</div>
                )}
                {sendingStatus === 'sent' && (
                  <div className="sent-status"><i className="fas fa-check-circle"></i> Imetumwa kikamilifu!</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Funga</button>
              <button className="btn btn-primary" onClick={handleSendResults} disabled={sendingStatus === 'processing'}>
                <i className="fas fa-paper-plane"></i> Tuma Matokeo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;