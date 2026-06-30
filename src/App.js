import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Timetable from './components/Timetable';
import TimetableAdmin from './components/TimetableAdmin';
import UserManagement from './components/UserManagement';
import Announcements from './components/Announcements';
import ProgressChart from './components/ProgressChart';

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
        <h2><i className="fas fa-chart-pie"></i> Dashboard ya Takwimu.
        </h2>
        <p>Muhtasari wa takwimu za wanafunzi wote</p>
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
            <p>Wasichana</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><i className="fas fa-male"></i></div>
          <div className="stat-info">
            <h3>{maleCount}</h3>
            <p>Wavulana</p>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><i className="fas fa-book"></i></div>
          <div className="stat-info">
            <h3>{Object.keys(courseStats).length}</h3>
            <p>Classes available</p>
          </div>
        </div>
      </div>
      
      <div className="charts-row">
        <div className="chart-card">
          <h4><i className="fas fa-venus-mars"></i> Students by Gender</h4>
          <div className="gender-chart">
            <div className="gender-bar male" style={{ width: `${(maleCount/totalStudents)*100}%` }}>
              <span>{maleCount} Male ({Math.round((maleCount/totalStudents)*100)}%)</span>
            </div>
            <div className="gender-bar female" style={{ width: `${(femaleCount/totalStudents)*100}%` }}>
              <span>{femaleCount} Female ({Math.round((femaleCount/totalStudents)*100)}%)</span>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h4><i className="fas fa-calendar-alt"></i> Age of Students</h4>
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
        <h4><i className="fas fa-trophy"></i> Classes with Most Students</h4>
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
                <span className="course-count">{count} students</span>
              </div>
            ))}
        </div>
      </div>
      
      <div className="recent-card">
        <h4><i className="fas fa-clock"></i> Recently Joined Students</h4>
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
              <p>No students available</p>
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
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Error: {error}</p>
          <button onClick={onLogout} className="btn btn-primary">Try Again</button>
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
          <button onClick={onLogout} className="logout-btn">Logout</button>
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
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="parent-dashboard">
        <div className="student-info-card">
          {student.photo && <img src={student.photo} alt="Student" className="student-photo-large" />}
          <h2>{student.fullName}</h2>
          <p><strong> Class:</strong> {student.course}</p>
          <p><strong> Age:</strong> {student.age} years</p>
          <p><strong> Gender:</strong> {student.gender === 'MALE' ? 'Male' : 'Female'}</p>
          <p><strong> Phone:</strong> {student.phone || 'Not provided'}</p>
          <p><strong> Email:</strong> {student.email || 'Not provided'}</p>
        </div>
        
        <div className="results-card">
          <h3><i className="fas fa-chart-line"></i> Exam Results</h3>
          {results.length === 0 ? (
            <div className="results-placeholder">
              <i className="fas fa-file-alt"></i>
              <p>No exam results available yet.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <span className="result-term"> {result.term} - {result.year}</span>
                  </div>
                  <table className="result-table">
                    <thead><tr><th>Subject</th><th>Grade</th></tr></thead>
                    <tbody>
                      {result.subject1 && <tr><td>{result.subject1}</td><td className="grade">{result.grade1}</td></tr>}
                      {result.subject2 && <tr><td>{result.subject2}</td><td className="grade">{result.grade2}</td></tr>}
                      {result.subject3 && <tr><td>{result.subject3}</td><td className="grade">{result.grade3}</td></tr>}
                      {result.subject4 && <tr><td>{result.subject4}</td><td className="grade">{result.grade4}</td></tr>}
                      {result.subject5 && <tr><td>{result.subject5}</td><td className="grade">{result.grade5}</td></tr>}
                      {result.subject6 && <tr><td>{result.subject6}</td><td className="grade">{result.grade6}</td></tr>}
                      {result.subject7 && <tr><td>{result.subject7}</td><td className="grade">{result.grade7}</td></tr>}
                    </tbody>
                  </table>
                  {result.remarks && <p className="result-remarks"><strong>Remarks:</strong> {result.remarks}</p>}
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
  const [userId, setUserId] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);
  const [showParentLogin, setShowParentLogin] = useState(false);

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

  // ============ PARENT LOGIN STATE ============
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(false);
  const [parentCode, setParentCode] = useState('');
  const [parentData, setParentData] = useState(null);
  const [parentLoginError, setParentLoginError] = useState('');

  // ============ STUDENT STATE ============
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showTimetableAdmin, setShowTimetableAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', age: '', class: '', gender: '', phone: '', email: '', photo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ============ MATOKEO MODAL STATE ============
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sendingStatus, setSendingStatus] = useState('');
  const [resultsData, setResultsData] = useState({
    subject1: '', score1: '', grade1: '',
    subject2: '', score2: '', grade2: '',
    subject3: '', score3: '', grade3: '',
    subject4: '', score4: '', grade4: '',
    subject5: '', score5: '', grade5: '',
    subject6: '', score6: '', grade6: '',
    subject7: '', score7: '', grade7: '',
    remarks: '',
    sendMethod: ''
  });

  // ============ API BASE URL ============
  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

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

  // ==================== PDF REPORT FUNCTIONS ====================
  const downloadStudentReport = (studentId) => {
    window.open(`${API_URL}/report/student/${studentId}`, '_blank');
  };

  const downloadAllStudentsReport = () => {
    window.open(`${API_URL}/report/all-students`, '_blank');
  };

  const downloadClassReport = (className) => {
    window.open(`${API_URL}/report/class/${encodeURIComponent(className)}`, '_blank');
  };

  // ==================== LOGIN FUNCTIONS ====================
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = loginForm;

    if (!username || !password) {
      setLoginError('Tafadhali jaza username na password!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUserRole(data.user.role);
        setUserName(data.user.fullName || data.user.username);
        setUserId(data.user.id);
        setLoginError('');
        console.log('✅ Logged in as:', data.user.role);
      } else {
        setLoginError(data.error || 'Username au password si sahihi!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Kuna tatizo, jaribu tena!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');
    setUserId(null);
    setLoginForm({ username: '', password: '' });
    setStudents([]);
    setShowDashboard(true);
    setShowTimetable(false);
    setShowTimetableAdmin(false);
    setShowUserManagement(false);
    setShowAnnouncements(false);
  };

  // ==================== REGISTRATION FUNCTIONS ====================
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setRegisterError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerData.username || !registerData.password || !registerData.email || !registerData.fullName) {
      setRegisterError('Tafadhali jaza sehemu zote muhimu!');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords hazifanani!');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Password iwe na herufi 6 au zaidi!');
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
          phone: registerData.phone || ''
        })
      });
      const data = await response.json();

      if (data.success) {
        setRegisterSuccess(true);
        setRegisterError('');
        // Auto-login after registration
        setIsLoggedIn(true);
        setUserRole('user');
        setUserName(registerData.fullName);
        setLoginForm({ username: registerData.username, password: registerData.password });
        setShowRegister(false);
        alert('✅ Akaunti imeundwa! Umewekwa kama Regular User. Admin anaweza kubadilisha role yako.');
      } else {
        setRegisterError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Kuna tatizo, jaribu tena!');
    }
  };

  // ==================== PARENT LOGIN FUNCTIONS ====================
  const handleParentLogin = async (e) => {
    e.preventDefault();

    if (!parentCode) {
      setParentLoginError('Tafadhali weka code ya mzazi!');
      return;
    }

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
        console.log('✅ Parent logged in with code:', parentCode);
      } else {
        setParentLoginError('Code si sahihi! Jaribu tena.');
      }
    } catch (error) {
      console.error('Parent login error:', error);
      setParentLoginError('Kuna tatizo, jaribu tena!');
    }
  };

  // ==================== PARENT CODE GENERATION (Admin only) ====================
  const generateParentCode = async (student) => {
    if (!canEdit) {
      alert('Sorry! You are a regular user, you do not have permission to generate parent codes.');
      return;
    }

    const parentName = prompt('Full name of the parent:');
    if (!parentName) return;

    const phone = prompt('Phone number of the parent:');
    const email = prompt('Email address of the parent:');

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
        alert(`✅ Parent code: ${data.parentCode}\n\nShare this code with the parent to access the Parent Portal.`);
        if (email) {
          try {
            await fetch(`${API_URL}/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: email,
                subject: 'Code yako ya Parent Portal',
                message: `Habari ${parentName},\n\nCode yako ya kuingia kwenye Parent Portal ni: ${data.parentCode}\n\nAsante,\nKatwe Secondary School`
              })
            });
            alert('✅ Code imetumwa kwa email ya mzazi!');
          } catch(e) {
            alert('⚠️ Code imeundwa lakini email haikutumwa.');
          }
        }
      } else {
        alert('❌ Imeshindwa kuunda code. Jaribu tena!');
      }
    } catch (error) {
      console.error('Error generating parent code:', error);
      alert('❌ Kuna tatizo, jaribu tena!');
    }
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
      
      alert(editingId ? '✅ Mwanafunzi amesajiliwa!' : '✅ Mwanafunzi amehifadhiwa!');
      fetchStudents();
      setFormData({ fullName: '', age: '', class: '', gender: '', phone: '', email: '', photo: '' });
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
      alert('Sorry! You are a regular user, you do not have permission to delete students.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this student?')) {
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

  // ============ MATOKEO MODAL ============
  const openResultsModal = (student) => {
    setSelectedStudent(student);
    setResultsData({
      subject1: '', score1: '', grade1: '',
      subject2: '', score2: '', grade2: '',
      subject3: '', score3: '', grade3: '',
      subject4: '', score4: '', grade4: '',
      subject5: '', score5: '', grade5: '',
      subject6: '', score6: '', grade6: '',
      subject7: '', score7: '', grade7: '',
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
          subject1: resultsData.subject1, grade1: resultsData.grade1,
          subject2: resultsData.subject2, grade2: resultsData.grade2,
          subject3: resultsData.subject3, grade3: resultsData.grade3,
          subject4: resultsData.subject4, grade4: resultsData.grade4,
          subject5: resultsData.subject5, grade5: resultsData.grade5,
          subject6: resultsData.subject6, grade6: resultsData.grade6,
          subject7: resultsData.subject7, grade7: resultsData.grade7,
          remarks: resultsData.remarks,
          term: 'Term 1',
          year: new Date().getFullYear()
        })
      });
      
      const saveData = await saveResponse.json();
      
      if (!saveData.success) {
        alert(' Imeshindwa kuhifadhi matokeo!');
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
          alert('Matokeo yamehifadhiwa lakini imeshindwa kutuma email!');
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
          alert('Matokeo yamehifadhiwa lakini imeshindwa kutuma SMS!');
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
    const headers = ["FULL NAME", "AGE", "GENDER", "CLASS", "PHONE NUMBER", "EMAIL"];
    const rows = students.map(s => [`"${s.fullName}"`, s.age, s.gender, `"${s.course}"`, `"${s.phone || ''}"`, `"${s.email || ''}"`]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "students_katwe_report.csv";
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
            <p>REGISTER YOUR ACCOUNT</p>
          </div>
          
          {registerSuccess ? (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <h3>✅ Registration Successful!</h3>
              <p>Please login with your credentials.</p>
              <button onClick={() => {
                setShowRegister(false);
                setRegisterSuccess(false);
              }} className="btn btn-primary">Go to Login</button>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Username *</label>
                <input type="text" name="username" value={registerData.username} onChange={handleRegisterChange} placeholder="Chagua username yako" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-id-card"></i> Jina (Full Name) *</label>
                <input type="text" name="fullName" value={registerData.fullName} onChange={handleRegisterChange} placeholder="Jina lako kamili" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-birthday-cake"></i> Umri (Age)</label>
                <input type="number" name="age" value={registerData.age || ''} onChange={handleRegisterChange} placeholder="Umri wako" min="1" max="120" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-venus-mars"></i> Jinsia (Gender)</label>
                <select name="gender" value={registerData.gender || ''} onChange={handleRegisterChange}>
                  <option value="">Chagua jinsia</option>
                  <option value="MALE">Kiume (Male)</option>
                  <option value="FEMALE">Kike (Female)</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Namba ya Simu (Phone Number)</label>
                <input type="tel" name="phone" value={registerData.phone} onChange={handleRegisterChange} placeholder="0712345678" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email *</label>
                <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="barua@pepe.com" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-image"></i> Picha (Upload Picture)</label>
                <input type="file" name="photo" accept="image/*" onChange={(e) => {
                  if (e.target.files[0]) {
                    setRegisterData({ ...registerData, photo: e.target.files[0] });
                  }
                }} />
                {registerData.photo && <small style={{ color: 'green' }}>📸 {registerData.photo.name}</small>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password *</label>
                <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Atleast 8 characters" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Confirm Password *</label>
                <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} placeholder="Andika password tena" required />
              </div>
              {registerError && <div className="error-message">{registerError}</div>}
              <button type="submit" className="btn-login">REGISTER</button>
              <button type="button" onClick={() => setShowRegister(false)} className="btn-outline" style={{ marginTop: '10px', width: '100%' }}>🔙 Rudi kwa Login</button>
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
          <form onSubmit={handleParentLogin}>
            <div className="form-group">
              <label><i className="fas fa-key"></i> Parent Code</label>
              <input type="text" value={parentCode} onChange={(e) => setParentCode(e.target.value)} placeholder="Weka code yako (kwa mfano: 123456)" required />
            </div>
            {parentLoginError && <div className="error-message">{parentLoginError}</div>}
            <button type="submit" className="btn-login">LOGIN</button>
          </form>
          <div className="login-footer">
            <p>Huna code? Wasiliana na shule kwa msaada.</p>
            <button onClick={() => { setShowParentLogin(false); setParentLoginError(''); }} className="btn-outline" style={{ width: '100%', marginTop: '10px' }}>🔙 Rudi kwa Login ya Shule</button>
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
            <p>Student Management System</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label><i className="fas fa-user"></i> Username</label>
              <input type="text" name="username" value={loginForm.username} onChange={handleLoginChange} placeholder="Weka username yako" required />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password</label>
              <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Weka password yako" required />
            </div>

            {loginError && <div className="error-message">{loginError}</div>}

            <button type="submit" className="btn-login">
              <i className="fas fa-sign-in-alt"></i> LOGIN
            </button>
          </form>

          <div className="login-footer">
            <p>
              Huna akaunti?{' '}
              <button onClick={() => { setShowRegister(true); setLoginError(''); }} className="link-btn">
                Jisajili hapa
              </button>
            </p>
            <p>
              <button onClick={() => { setShowParentLogin(true); setLoginError(''); }} className="link-btn">
                 Mzazi / Guardian
              </button>
            </p>
            <hr />
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              &copy; {new Date().getFullYear()} Katwe Secondary School. All rights reserved.
            </p>
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
         HELLO!  |  WELCOME TO KATWE SECONDARY SCHOOL  |   STUDENT  MANAGEMENT & RESULTS   |  ENJOY OUR WEBSITE!  |   KARIBU SANA!    |   CALL US: +255 614910462  |   EMAIL: katwesec@gmail.com
      </marquee>
      
      <div className="school-header">
        <div className="user-info">
          <i className={userRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
          <span>
            <strong>{userName}</strong> 
            <small>({userRole === 'admin' ? 'Administrator' : 'Regular User'})</small>
          </span>
        </div>
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>STUDENT MANAGEMENT & RESULTS</p>
        
        <div className="toggle-buttons">
          <button 
            className={`toggle-btn ${showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement && !showAnnouncements ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(true); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}
          >
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          <button 
            className={`toggle-btn ${!showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement && !showAnnouncements ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}
          >
            <i className="fas fa-users"></i> Wanafunzi
          </button>
          <button 
            className={`toggle-btn ${showTimetable ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(true); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}
          >
            <i className="fas fa-calendar-alt"></i> Timetable
          </button>
          
          {userRole === 'admin' && (
            <>
              <button 
                className={`toggle-btn ${showTimetableAdmin ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(true); setShowUserManagement(false); setShowAnnouncements(false); }}
              >
                <i className="fas fa-cog"></i> Timetable Admin
              </button>
              <button 
                className={`toggle-btn ${showUserManagement ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(true); setShowAnnouncements(false); }}
              >
                <i className="fas fa-users-cog"></i> User Management
              </button>
              <button 
                className={`toggle-btn ${showAnnouncements ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(true); }}
              >
                <i className="fas fa-bullhorn"></i> Matangazo
              </button>
            </>
          )}
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> LOGOUT
        </button>
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
        <div className="card"></div>
         

            {/* ORODHA YA WANAFUNZI */}
            <div className="card">
              <div className="card-header">
                <i className="fas fa-users"></i>
                <h2>ORODHA RASMI YA WANAFUNZI</h2>
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
                      <tr><th>PICHA</th><th>JINA</th><th>DARASA</th><th>SIMU</th><th>EMAIL</th><th>VITENDO</th></tr>
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
                              <button className="btn btn-sm btn-info" onClick={() => downloadStudentReport(student.id)}><i className="fas fa-file-pdf"></i> PDF</button>
                              <button className="btn btn-sm btn-info" onClick={() => {
                                setSelectedStudentForProgress(student);
                                setShowProgressModal(true);
                              }}><i className="fas fa-chart-line"></i> Progress</button>
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
                  <span><i className="fas fa-download"></i> <strong>PAKUA RIPOTI</strong></span>
                  <div className="download-buttons">
                    <button onClick={downloadCSV} className="btn btn-outline btn-sm"><i className="fas fa-file-csv"></i> CSV</button>
                    <button onClick={downloadAllStudentsReport} className="btn btn-outline btn-sm"><i className="fas fa-file-pdf"></i> Wanafunzi Wote PDF</button>
                    <button onClick={() => downloadClassReport('Form 1')} className="btn btn-outline btn-sm"><i className="fas fa-file-pdf"></i> Ripoti ya Darasa PDF</button>
                  </div>
                </div>
              </div>
            </div>


          {/* MODAL YA KUJAZA MATOKEO */}
          {showModal && selectedStudent && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px', width: '90%'}}>
                <div className="modal-header">
                  <h2><i className="fas fa-chart-line"></i> Jaza Matokeo - {selectedStudent.fullName}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                  <div className="results-form">
                    <h3>Masomo 7</h3>
                    
                    {/* Somo 1 */}
                    <div className="form-group">
                      <label>Somo la 1</label>
                      <div className="subject-row">
                        <input type="text" name="subject1" placeholder="Jina la somo" value={resultsData.subject1} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score1" placeholder="Alama" value={resultsData.score1} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade1" value={resultsData.grade1} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 2 */}
                    <div className="form-group">
                      <label>Somo la 2</label>
                      <div className="subject-row">
                        <input type="text" name="subject2" placeholder="Jina la somo" value={resultsData.subject2} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score2" placeholder="Alama" value={resultsData.score2} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade2" value={resultsData.grade2} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 3 */}
                    <div className="form-group">
                      <label>Somo la 3</label>
                      <div className="subject-row">
                        <input type="text" name="subject3" placeholder="Jina la somo" value={resultsData.subject3} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score3" placeholder="Alama" value={resultsData.score3} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade3" value={resultsData.grade3} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 4 */}
                    <div className="form-group">
                      <label>Somo la 4</label>
                      <div className="subject-row">
                        <input type="text" name="subject4" placeholder="Jina la somo" value={resultsData.subject4} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score4" placeholder="Alama" value={resultsData.score4} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade4" value={resultsData.grade4} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 5 */}
                    <div className="form-group">
                      <label>Somo la 5</label>
                      <div className="subject-row">
                        <input type="text" name="subject5" placeholder="Jina la somo" value={resultsData.subject5} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score5" placeholder="Alama" value={resultsData.score5} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade5" value={resultsData.grade5} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 6 */}
                    <div className="form-group">
                      <label>Somo la 6</label>
                      <div className="subject-row">
                        <input type="text" name="subject6" placeholder="Jina la somo" value={resultsData.subject6} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score6" placeholder="Alama" value={resultsData.score6} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade6" value={resultsData.grade6} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Somo 7 */}
                    <div className="form-group">
                      <label>Somo la 7</label>
                      <div className="subject-row">
                        <input type="text" name="subject7" placeholder="Jina la somo" value={resultsData.subject7} onChange={handleResultsChange} style={{flex: 2}} />
                        <input type="number" name="score7" placeholder="Alama" value={resultsData.score7} onChange={handleResultsChange} style={{width: 80}} />
                        <select name="grade7" value={resultsData.grade7} onChange={handleResultsChange} style={{width: 70}}>
                          <option value="">Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
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
                          <i className="fas fa-envelope"></i> Tuma kwa Email
                        </label>
                        <label className="send-option">
                          <input type="radio" name="sendMethod" value="sms" onChange={handleResultsChange} />
                          <i className="fas fa-sms"></i> Tuma kwa SMS
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

          {/* MODAL YA PROGRESS CHART */}
          {showProgressModal && selectedStudentForProgress && (
            <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
              <div className="modal-content progress-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2><i className="fas fa-chart-line"></i> Maendeleo ya {selectedStudentForProgress.fullName}</h2>
                  <button className="modal-close" onClick={() => setShowProgressModal(false)}>&times;</button>
                </div>
                <div className="modal-body">
                  <ProgressChart 
                    studentId={selectedStudentForProgress.id} 
                    studentName={selectedStudentForProgress.fullName}
                  />
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