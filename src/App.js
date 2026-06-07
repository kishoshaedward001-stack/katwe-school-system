import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Timetable from './components/Timetable';
import TimetableAdmin from './components/TimetableAdmin';
import UserManagement from './components/UserManagement';
import Announcements from './components/Announcements';

// ============ DASHBOARD COMPONENT ============
const StatisticsDashboard = ({ students }) => {
  const totalStudents = students.length;
  const maleCount = students.filter(s => s.gender === 'MALE').length;
  const femaleCount = students.filter(s => s.gender === 'FEMALE').length;
  
  const courseStats = {};
  students.forEach(s => {
    courseStats[s.course] = (courseStats[s.course] || 0) + 1;
  });
  
  const ageGroups = {
    'Under 18': students.filter(s => s.age < 18).length,
    '18-20': students.filter(s => s.age >= 18 && s.age <= 20).length,
    '21-23': students.filter(s => s.age >= 21 && s.age <= 23).length,
    'Above 23': students.filter(s => s.age > 23).length
  };
  
  const recentStudents = [...students].reverse().slice(0, 5);
  
  return (
    <div className="dashboard-stats">
      <div className="dashboard-header">
        <h2><i className="fas fa-chart-pie"></i> Dashboard ya Takwiri</h2>
        <p>Muhtasari wa takwiri za wanafunzi wote</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Jumla ya Wanafunzi</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><i className="fas fa-female"></i></div>
          <div className="stat-info">
            <h3>{femaleCount}</h3>
            <p>Wanawake</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><i className="fas fa-male"></i></div>
          <div className="stat-info">
            <h3>{maleCount}</h3>
            <p>Wanaume</p>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><i className="fas fa-book"></i></div>
          <div className="stat-info">
            <h3>{Object.keys(courseStats).length}</h3>
            <p>Kozi Zilizopo</p>
          </div>
        </div>
      </div>
      
      <div className="charts-row">
        <div className="chart-card">
          <h4><i className="fas fa-venus-mars"></i> Wanafunzi kwa Jinsia</h4>
          <div className="gender-chart">
            <div className="gender-bar male" style={{ width: `${(maleCount/totalStudents)*100}%` }}>
              <span>{maleCount} Wanaume ({Math.round((maleCount/totalStudents)*100)}%)</span>
            </div>
            <div className="gender-bar female" style={{ width: `${(femaleCount/totalStudents)*100}%` }}>
              <span>{femaleCount} Wanawake ({Math.round((femaleCount/totalStudents)*100)}%)</span>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h4><i className="fas fa-calendar-alt"></i> Umri wa Wanafunzi</h4>
          <div className="age-stats">
            {Object.entries(ageGroups).map(([group, count]) => (
              <div key={group} className="age-item">
                <span>{group}</span>
                <div className="age-bar-container">
                  <div className="age-bar" style={{ width: `${(count/totalStudents)*100}%` }}></div>
                </div>
                <span className="age-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="courses-card">
        <h4><i className="fas fa-trophy"></i> Kozi Zilizo na Wanafunzi Wengi</h4>
        <div className="courses-list">
          {Object.entries(courseStats)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([course, count]) => (
              <div key={course} className="course-item">
                <span>{course}</span>
                <div className="course-bar-container">
                  <div className="course-bar" style={{ width: `${(count/totalStudents)*100}%` }}></div>
                </div>
                <span className="course-count">{count} wanafunzi</span>
              </div>
            ))}
        </div>
      </div>
      
      <div className="recent-card">
        <h4><i className="fas fa-clock"></i> Wanafunzi Waliojiunga Hivi Karibuni</h4>
        <div className="recent-list">
          {recentStudents.map(student => (
            <div key={student.id} className="recent-item">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="recent-photo" />
              ) : (
                <i className="fas fa-user-graduate"></i>
              )}
              <span>
                <strong>{student.fullName}</strong>
                <small>{student.course}</small>
              </span>
              <span className="recent-badge">{student.gender}</span>
            </div>
          ))}
          {recentStudents.length === 0 && (
            <div className="no-data">
              <i className="fas fa-folder-open"></i>
              <p>Hakuna wanafunzi waliopo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ PARENT DASHBOARD COMPONENT ============
const ParentDashboard = ({ parentData, onLogout }) => {
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(`${API_URL}/parents/${parentData.parentcode}/student`);
        const studentData = await studentRes.json();
        
        if (studentData.success) {
          setStudent(studentData.student);
          
          const resultsRes = await fetch(`${API_URL}/parents/${parentData.parentcode}/results`);
          const resultsData = await resultsRes.json();
          
          if (resultsData.success) {
            setResults(resultsData.results);
          }
        } else {
          setError(studentData.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (parentData && parentData.parentcode) {
      fetchData();
    }
  }, [parentData, API_URL]);

  if (loading) {
    return (
      <div className="container">
        <div className="school-header">
          <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
          <p>Parent Portal</p>
        </div>
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Inapakia taarifa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="school-header">
          <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
          <p>Parent Portal</p>
          <button onClick={onLogout} className="logout-btn">TONDA</button>
        </div>
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Error: {error}</p>
          <button onClick={onLogout} className="btn btn-primary">Jaribu tena</button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container">
        <div className="school-header">
          <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
          <p>Parent Portal</p>
          <button onClick={onLogout} className="logout-btn">TONDA</button>
        </div>
        <div className="error-container">
          <p>Hakuna taarifa za mwanafunzi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="school-header">
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>Parent Portal - Karibu {parentData.parentname}</p>
        <button onClick={onLogout} className="logout-btn">TONDA MFUMO</button>
      </div>

      <div className="parent-dashboard">
        <div className="student-info-card">
          {student.photo && <img src={student.photo} alt="Student" className="student-photo-large" />}
          <h2>{student.fullName}</h2>
          <p><strong>📚 Kozi:</strong> {student.course}</p>
          <p><strong>🎂 Umri:</strong> {student.age} years</p>
          <p><strong>👤 Jinsia:</strong> {student.gender === 'MALE' ? 'Mwanaume' : 'Mwanamke'}</p>
          <p><strong>📞 Simu:</strong> {student.phone || 'Hajajazwa'}</p>
          <p><strong>📧 Email:</strong> {student.email || 'Hajajazwa'}</p>
        </div>
        
        <div className="results-card">
          <h3><i className="fas fa-chart-line"></i> Matokeo ya Mitihani</h3>
          {results.length === 0 ? (
            <div className="results-placeholder">
              <i className="fas fa-file-alt"></i>
              <p>Bado hakuna matokeo yaliyochapishwa.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <span className="result-term">📅 {result.term} - {result.year}</span>
                  </div>
                  <table className="result-table">
                    <thead><tr><th>Somo</th><th>Daraja</th></tr></thead>
                    <tbody>
                      {result.subject1 && <tr><td>{result.subject1}</td><td className="grade">{result.grade1}</td></tr>}
                      {result.subject2 && <tr><td>{result.subject2}</td><td className="grade">{result.grade2}</td></tr>}
                      {result.subject3 && <tr><td>{result.subject3}</td><td className="grade">{result.grade3}</td></tr>}
                      {result.subject4 && <tr><td>{result.subject4}</td><td className="grade">{result.grade4}</td></tr>}
                    </tbody>
                  </table>
                  {result.remarks && <p className="result-remarks"><strong>Maoni:</strong> {result.remarks}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ MAIN APP COMPONENT ============
function App() {
  // ============ STATE ZA LOGIN ============
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showParentLogin, setShowParentLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ============ REGISTRATION STATE ============
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // ============ PARENT STATE ============
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(false);
  const [parentCode, setParentCode] = useState('');
  const [parentData, setParentData] = useState(null);
  const [parentLoginError, setParentLoginError] = useState('');

  // ============ STATE ZA WANAFUNZI ============
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showTimetableAdmin, setShowTimetableAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', age: '', course: '', gender: '', phone: '', email: '', photo: ''
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
  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

  // ============ USER CREDENTIALS (for admin only) ============
  const users = {
    admin: [{ username: 'admin', password: 'admin123', role: 'admin', name: 'welcome admin' }],
    regular: [{ username: '', password: '', role: 'user', name: '' }]
  };

  // ============ PERMISSIONS ============
  const canEdit = userRole === 'admin';
  const canDelete = userRole === 'admin';
  const canAdd = userRole === 'admin';

  // ============ FETCH STUDENTS ============
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/students`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn, fetchStudents]);

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
    setShowDashboard(true);
    setShowTimetable(false);
    setShowTimetableAdmin(false);
    setShowUserManagement(false);
  };

  // ============ PHOTO UPLOAD ============
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formDataPhoto = new FormData();
    formDataPhoto.append('photo', file);
    
    setUploadingPhoto(true);
    try {
      const response = await fetch(`${API_URL}/upload-photo`, {
        method: 'POST',
        body: formDataPhoto
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, photo: data.imageUrl }));
        alert('✅ Picha imepakiwa!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Imeshindwa kupakia picha');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ============ STUDENT CRUD ============
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
      setFormData({ fullName: '', age: '', course: '', gender: '', phone: '', email: '', photo: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('❌ Kuna tatizo, jaribu tena!');
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
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        alert('✅ Mwanafunzi amefutwa!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Imeshindwa kufuta, jaribu tena!');
      }
    }
  };

  // ============ PARENT CODE GENERATION ============
  const generateParentCode = async (student) => {
    const parentName = prompt('Jina la mzazi:');
    if (!parentName) return;
    
    const phone = prompt('Namba ya simu ya mzazi:');
    const email = prompt('Barua pepe ya mzazi:');
    
    try {
      const response = await fetch(`${API_URL}/parents/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          parentName,
          phone,
          email
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Code ya mzazi: ${data.parentCode}\n\nWape mzazi code hii kuingia kwenye Parent Portal.`);
      } else {
        alert('❌ Imeshindwa kuunda code. Jaribu tena!');
      }
    } catch (error) {
      console.error('Error generating parent code:', error);
      alert('❌ Kuna tatizo, jaribu tena!');
    }
  };

  // ============ MATOKEO MODAL ============
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
      // Save results to database first
      const saveResponse = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          subject1: resultsData.subject1,
          grade1: resultsData.grade1,
          subject2: resultsData.subject2,
          grade2: resultsData.grade2,
          subject3: resultsData.subject3,
          grade3: resultsData.grade3,
          subject4: resultsData.subject4,
          grade4: resultsData.grade4,
          remarks: resultsData.remarks,
          term: 'Term 1',
          year: new Date().getFullYear()
        })
      });
      
      const saveData = await saveResponse.json();
      
      if (!saveData.success) {
        alert('❌ Imeshindwa kuhifadhi matokeo!');
        setSendingStatus('');
        return;
      }
      
      // Then send via email or SMS
      if (resultsData.sendMethod === 'email') {
        if (!selectedStudent.email) {
          alert('Mwanafunzi hana anuani ya email!');
          setSendingStatus('');
          return;
        }
        
        const emailResponse = await fetch(`${API_URL}/send-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: selectedStudent,
            results: resultsData
          })
        });
        
        const emailData = await emailResponse.json();
        
        if (emailData.success) {
          alert(`✅ Matokeo yamehifadhiwa na kutumwa kwa email!`);
          setShowModal(false);
          fetchStudents();
        } else {
          alert('⚠️ Matokeo yamehifadhiwa lakini imeshindwa kutuma email!');
        }
      } 
      else if (resultsData.sendMethod === 'sms') {
        if (!selectedStudent.phone) {
          alert('Mwanafunzi hana namba ya simu!');
          setSendingStatus('');
          return;
        }
        
        const smsResponse = await fetch(`${API_URL}/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: selectedStudent,
            results: resultsData
          })
        });
        
        const smsData = await smsResponse.json();
        
        if (smsData.success) {
          alert(`✅ Matokeo yamehifadhiwa na kutumwa kwa SMS!`);
          setShowModal(false);
          fetchStudents();
        } else {
          alert('⚠️ Matokeo yamehifadhiwa lakini imeshindwa kutuma SMS!');
        }
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('❌ Kuna tatizo, jaribu tena!');
    } finally {
      setSendingStatus('');
    }
  };

  // ============ FILTER STUDENTS ============
  const filteredStudents = students.filter(s =>
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // ============ REGISTRATION PAGE ============
  if (showRegister) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <i className="fas fa-user-plus"></i>
            <h1>KATWE SECONDARY SCHOOL</h1>
            <p>Jisajili kwa akaunti yako</p>
          </div>
          
          {registerSuccess ? (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <h3>Registration Successful!</h3>
              <p>Your account has been created. Please wait for admin approval.</p>
              <p>You will receive an email once your account is approved.</p>
              <button onClick={() => {
                setShowRegister(false);
                setRegisterSuccess(false);
              }} className="btn btn-primary">Go to Login</button>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (registerData.password !== registerData.confirmPassword) {
                setRegisterError('Passwords do not match!');
                return;
              }
              try {
                const response = await fetch(`${API_URL}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: registerData.username,
                    email: registerData.email,
                    password: registerData.password,
                    fullName: registerData.fullName,
                    phone: registerData.phone
                  })
                });
                const data = await response.json();
                if (data.success) {
                  setRegisterSuccess(true);
                  setRegisterError('');
                } else {
                  setRegisterError(data.error);
                }
              } catch (error) {
                setRegisterError('Registration failed. Please try again.');
              }
            }}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Username *</label>
                <input type="text" value={registerData.username} onChange={(e) => setRegisterData({...registerData, username: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email *</label>
                <input type="email" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password *</label>
                <input type="password" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Confirm Password *</label>
                <input type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-id-card"></i> Full Name</label>
                <input type="text" value={registerData.fullName} onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Phone Number</label>
                <input type="tel" value={registerData.phone} onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} />
              </div>
              {registerError && <div className="error-message">{registerError}</div>}
              <button type="submit" className="btn-login">Register</button>
              <button type="button" onClick={() => setShowRegister(false)} className="btn-outline" style={{marginTop: '10px'}}>Back to Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ============ PARENT LOGIN PAGE ============
  if (showParentLogin && !isParentLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <i className="fas fa-users"></i>
            <h1>KATWE SECONDARY SCHOOL</h1>
            <p>Parent Portal - Ingiza Code Yako</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await fetch(`${API_URL}/parents/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentCode })
              });
              const data = await response.json();
              if (data.success) {
                setIsParentLoggedIn(true);
                setParentData(data.parent);
                setParentLoginError('');
              } else {
                setParentLoginError('Code si sahihi! Jaribu tena.');
              }
            } catch (error) {
              setParentLoginError('Kuna tatizo, jaribu tena!');
            }
          }}>
            <div className="form-group">
              <label><i className="fas fa-key"></i> Parent Code</label>
              <input type="text" value={parentCode} onChange={(e) => setParentCode(e.target.value)} placeholder="Weka code yako (kwa mfano: 123456)" required />
            </div>
            {parentLoginError && <div className="error-message">{parentLoginError}</div>}
            <button type="submit" className="btn-login">INGIA</button>
          </form>
          <div className="login-footer">
            <p>Huna code? Wasiliana na shule kwa msaada kwa maelezo zaidi </p>
            <button onClick={() => setShowParentLogin(false)} className="btn-outline">Rudi kwa Login ya Shule</button>
          </div>
        </div>
      </div>
    );
  }

  // ============ PARENT DASHBOARD ============
  if (isParentLoggedIn && parentData) {
    return <ParentDashboard parentData={parentData} onLogout={() => {
      setIsParentLoggedIn(false);
      setParentData(null);
      setParentCode('');
    }} />;
  }

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
                  <div><strong>Admin</strong><small>Access kamili ya kudhibiti</small></div>
                </button>
                <button type="button" onClick={() => handleRoleSelect('user')} className="role-btn user-role">
                  <i className="fas fa-user"></i>
                  <div><strong>User wa Kawaida</strong><small>Kutazama tu (Read only)</small></div>
                </button>
                <button type="button" onClick={() => setShowParentLogin(true)} className="role-btn parent-role">
                  <i className="fas fa-users"></i>
                  <div><strong>Mzazi / Guardian</strong><small>Angalia matokeo ya mtoto wako</small></div>
                </button>
              </div>
              <div className="register-link">
    <p>Huna akaunti? <button onClick={() => setShowRegister(true)} className="link-btn">Jisajili hapa</button></p>
  </div>
</div>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="role-badge">
                <span className={`role-badge-${selectedRole}`}>
                  <i className={selectedRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
                  {selectedRole === 'admin' ? ' Admin Login' : ' User Login'}
                </span>
                <button type="button" onClick={() => setSelectedRole(null)} className="change-role-btn">Badilisha</button>
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
              <button type="submit" className="btn-login">INGIA</button>
            </form>
          )}
          
          <div className="login-footer">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>User:</strong> teacher / teacher123</p>
            <p><strong>Parent:</strong> Ingiza code uliyopewa na shule</p>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN DASHBOARD ============
  return (
    <div className="container">
      <marquee 
        behavior="scroll" 
        direction="left" 
        scrollamount="4"
        style={{
          background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00cc00, #0099ff, #6600cc, #ff00ff)',
          padding: '12px',
          borderRadius: '50px',
          marginBottom: '15px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        🔥 HELLO! 🔥  |  ✨ WELCOME TO KATWE SECONDARY SCHOOL ✨  |  📚 STUDENT ANALYTICS & MANAGEMENT HUB 📚  |  🎓 ENJOY OUR WEBSITE! 🎓  |   KARIBU SANA! 
      </marquee>
      
      <div className="school-header">
        <div className="user-info">
          <i className={userRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
          <span><strong>{userName}</strong><small>({userRole === 'admin' ? 'Administrator' : 'Regular User'})</small></span>
        </div>
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>STUDENT ANALYTICS & MANAGEMENT HUB & MODAL YA MATOKEO</p>
        
        <div className="toggle-buttons">
          <button className={`toggle-btn ${showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(true); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); }}>
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          <button className={`toggle-btn ${!showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); }}>
            <i className="fas fa-users"></i> Wanafunzi
          </button>
          <button className={`toggle-btn ${showTimetable ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(true); setShowTimetableAdmin(false); setShowUserManagement(false); }}>
            <i className="fas fa-calendar-alt"></i> Timetable
          </button>
          
          {userRole === 'admin' && (
            <>
              <button className={`toggle-btn ${showTimetableAdmin ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(true); setShowUserManagement(false); }}>
                <i className="fas fa-cog"></i> Timetable Admin
              </button>
              <button className={`toggle-btn ${showUserManagement ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(true); }}>
                <i className="fas fa-users-cog"></i> User Management
              </button>
              <button 
    className={`toggle-btn ${showAnnouncements ? 'active' : ''}`}
    onClick={() => {
        setShowDashboard(false);
        setShowTimetable(false);
        setShowTimetableAdmin(false);
        setShowUserManagement(false);
        setShowAnnouncements(true);
    }}
>
    <i className="fas fa-bullhorn"></i> Matangazo
</button>
            </>
          )}
        </div>
        
        <button onClick={handleLogout} className="logout-btn">TONDA MFUMO</button>
      </div>

{showAnnouncements ? (
  <Announcements />
) : showUserManagement ? (
  <UserManagement />
) : showTimetableAdmin ? (
  <TimetableAdmin />
) : showTimetable ? (
  <Timetable />
) : showDashboard ? (
  <StatisticsDashboard students={students} />
) : (
  <>
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
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>UMRI *</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>KOZI YA MASOMO *</label>
                    <input type="text" name="course" value={formData.course} onChange={handleChange} required disabled={!canAdd} />
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
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>Barua pepe (Email)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!canAdd} />
                  </div>
                  
                  <div className="form-group">
                    <label>PICHA YA MWANAFUNZI</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={!canAdd || uploadingPhoto} />
                    {uploadingPhoto && <div className="uploading-text"><i className="fas fa-spinner fa-spin"></i> Inapakia picha...</div>}
                    {formData.photo && (
                      <div className="photo-preview">
                        <img src={formData.photo} alt="Student" />
                        <button type="button" onClick={() => setFormData({...formData, photo: ''})} className="btn-remove-photo">Futa Picha</button>
                      </div>
                    )}
                  </div>
                  
                  {canAdd && (
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i> {editingId ? 'SASISHA' : 'HIFADHI'}
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
                  <span className="stat-badge">Wanafunzi {filteredStudents.length}</span>
                </div>
                
                {loading && <div className="loading-spinner">Inapakia data...</div>}
                
                <div className="table-wrapper">
                  <table className="student-table">
                    <thead>
                      <tr><th>PICHA</th><th>JINA</th><th>KOZI</th><th>SIMU</th><th>EMAIL</th><th>VITENDO</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 && !loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>📭 Hakuna wanafunzi waliosajiliwa</td></tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.id}>
                            <td className="photo-cell">
                              {student.photo ? <img src={student.photo} alt={student.fullName} className="student-thumb" /> : <div className="no-photo">📷</div>}
                            </td>
                            <td><strong>{student.fullName}</strong><br/><small>{student.age} yrs | {student.gender}</small></td>
                            <td>{student.course}</td>
                            <td>{student.phone || '—'}</td>
                            <td>{student.email || '—'}</td>
                            <td className="action-buttons">
                              <button className="btn btn-sm btn-primary" onClick={() => openResultsModal(student)}><i className="fas fa-chart-line"></i> Matokeo</button>
                              {canEdit && <button className="btn btn-sm btn-outline" onClick={() => handleEdit(student)}><i className="fas fa-edit"></i> Edit</button>}
                              {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}><i className="fas fa-trash-alt"></i> Futa</button>}
                              {canEdit && <button className="btn btn-sm btn-success" onClick={() => generateParentCode(student)}><i className="fas fa-users"></i> Parent Code</button>}
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

          {/* MODAL YA KUJAZA MATOKEO */}
          {showModal && selectedStudent && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2><i className="fas fa-chart-line"></i> Jaza Matokeo - {selectedStudent.fullName}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="results-form">
                    <div className="form-group">
                      <label>SOMO LA 1</label>
                      <div className="subject-row">
                        <input type="text" name="subject1" placeholder="Jina la somo" value={resultsData.subject1} onChange={handleResultsChange} />
                        <select name="grade1" value={resultsData.grade1} onChange={handleResultsChange}>
                          <option value="">Daraja</option>
                          <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                          <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>SOMO LA 2</label>
                      <div className="subject-row">
                        <input type="text" name="subject2" placeholder="Jina la somo" value={resultsData.subject2} onChange={handleResultsChange} />
                        <select name="grade2" value={resultsData.grade2} onChange={handleResultsChange}>
                          <option value="">Daraja</option>
                          <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                          <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>SOMO LA 3</label>
                      <div className="subject-row">
                        <input type="text" name="subject3" placeholder="Jina la somo" value={resultsData.subject3} onChange={handleResultsChange} />
                        <select name="grade3" value={resultsData.grade3} onChange={handleResultsChange}>
                          <option value="">Daraja</option>
                          <option value="A">A</option><option value="B+">B+</option><option value="B">B</option>
                          <option value="C+">C+</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                        </select>
                      </div>
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
        </>
      )}
    </div>
  );
}

export default App;