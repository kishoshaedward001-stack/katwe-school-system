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

  const recentStudents = students.slice(-5).reverse();

  const malePercent = totalStudents ? Math.round((maleCount / totalStudents) * 100) : 0;
  const femalePercent = totalStudents ? Math.round((femaleCount / totalStudents) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2><i className="fas fa-chart-pie"></i> Statistics</h2>
        <p>Summary of student statistics</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><i className="fas fa-female"></i></div>
          <div className="stat-info">
            <h3>{femaleCount}</h3>
            <p>Female Students</p>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><i className="fas fa-male"></i></div>
          <div className="stat-info">
            <h3>{maleCount}</h3>
            <p>Male Students</p>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><i className="fas fa-book"></i></div>
          <div className="stat-info">
            <h3>{Object.keys(courseStats).length}</h3>
            <p>Courses</p>
          </div>
        </div>
      </div>
      
      <div className="charts-row">
        <div className="chart-card">
          <h4><i className="fas fa-venus-mars"></i> Students by Gender</h4>
          <div className="gender-chart">
            <div className="gender-bar male" style={{ width: `${malePercent}%` }}>
              <span>{maleCount} Male ({malePercent}%)</span>
            </div>
            <div className="gender-bar female" style={{ width: `${femalePercent}%` }}>
              <span>{femaleCount} Female ({femalePercent}%)</span>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h4><i className="fas fa-calendar-alt"></i> Students by Age Group</h4>
          <div className="age-stats">
            {Object.entries(ageGroups).map(([group, count]) => (
              <div key={group} className="age-item">
                <span>{group}</span>
                <div className="age-bar-container">
                  <div className="age-bar" style={{ width: `${totalStudents ? (count / totalStudents) * 100 : 0}%` }}></div>
                </div>
                <span className="age-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="courses-card">
        <h4><i className="fas fa-trophy"></i> Courses with Most Students</h4>
        <div className="courses-list">
          {Object.entries(courseStats)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([course, count]) => (
              <div key={course} className="course-item">
                <span>{course}</span>
                <div className="course-bar-container">
                  <div className="course-bar" style={{ width: `${totalStudents ? (count / totalStudents) * 100 : 0}%` }}></div>
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
              <p>No recently joined students</p>
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
          <p>Loading data...</p>
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
          <button onClick={onLogout} className="logout-btn">LOG OUT</button>
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
          <button onClick={onLogout} className="logout-btn">LOG OUT</button>
        </div>
        <div className="error-container">
          <p>No student information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="school-header">
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>Parent Portal - Karibu {parentData.parentname}</p>
        <button onClick={onLogout} className="logout-btn">LOG OUT</button>
      </div>

      <div className="parent-dashboard">
        <div className="student-info-card">
          {student.photo && <img src={student.photo} alt="Student" className="student-photo-large" />}
          <h2>{student.fullName}</h2>
          <p><strong> course:</strong> {student.course}</p>
          <p><strong> age:</strong> {student.age} years</p>
          <p><strong> Gender:</strong> {student.gender === 'MALE' ? 'Male' : 'Female'}</p>
          <p><strong> Phone:</strong> {student.phone || 'Not provided'}</p>
          <p><strong> Email:</strong> {student.email || 'Not provided'}</p>
        </div>
        
        <div className="results-card">
          <h3><i className="fas fa-chart-line"></i> Matokeo ya Mitihani</h3>
          {results.length === 0 ? (
            <div className="results-placeholder">
              <i className="fas fa-file-alt"></i>
              <p>No results available.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <span className="result-term">📅 {result.term} - {result.year}</span>
                  </div>
                  <table className="result-table">
                    <thead><tr><th>Subject</th><th>Grade</th></tr></thead>
                    <tbody>
                      {result.subject1 && <tr><td>{result.subject1}</td><td className="grade">{result.grade1}</td></tr>}
                      {result.subject2 && <tr><td>{result.subject2}</td><td className="grade">{result.grade2}</td></tr>}
                      {result.subject3 && <tr><td>{result.subject3}</td><td className="grade">{result.grade3}</td></tr>}
                      {result.subject4 && <tr><td>{result.subject4}</td><td className="grade">{result.grade4}</td></tr>}
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
  const [showTimetableAdmin, setShowTimetableAdmin] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  // PWA Installation
const [deferredPrompt, setDeferredPrompt] = useState(null);
const [showInstallButton, setShowInstallButton] = useState(false);
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
  // ============ USER CREDENTIALS (for admin only) ============
  const users = {
    admin: [{ username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Mkuu' }],
    regular: [{ username: 'teacher', password: 'teacher123', role: 'user', name: 'Mwalimu' }]
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
  // PWA - Listen for install prompt
useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallButton(true);
    });
}, []);

  // ============ PDF REPORT FUNCTIONS ============
  const downloadStudentReport = (studentId) => {
    window.open(`${API_URL}/report/student/${studentId}`, '_blank');
  };

  const downloadAllStudentsReport = () => {
    window.open(`${API_URL}/report/all-students`, '_blank');
  };

  const downloadClassReport = (className) => {
    window.open(`${API_URL}/report/class/${encodeURIComponent(className)}`, '_blank');
  };

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
    setShowAnnouncements(false);
  };
  // Handle PWA installation
const handleInstallClick = () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            setDeferredPrompt(null);
            setShowInstallButton(false);
        });
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
        alert('✅ Photo uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ You have no ability to upload photo. Please try again!');
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
      alert('sorry, you do not have permission to add students.');
      return;
    }

    if (!formData.fullName || !formData.age || !formData.course || !formData.gender) {
      alert('please fill in all required fields (full name, age, course, gender)');
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
      
      alert(editingId ? '✅ Student updated successfully!' : '✅ Student saved successfully!');
      fetchStudents();
      setFormData({ fullName: '', age: '', course: '', gender: '', phone: '', email: '', photo: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('❌ Failed to save student. Please try again!');
    }
  };

  const handleEdit = (student) => {
    if (!canEdit) {
      alert('⚠️ Sorry! You are a regular user, you do not have permission to edit students.');
      return;
    }
    setFormData(student);
    setEditingId(student.id);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert('⚠️ Sorry! You are a regular user, you do not have permission to delete students.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        alert('✅ Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Failed to delete student. Please try again!');
      }
    }
  };

  // ============ PARENT CODE GENERATION ============
  const generateParentCode = async (student) => {
    const parentName = prompt('Parent\'s Name:');
    if (!parentName) return;
    
    const phone = prompt('Parent\'s Phone Number:');
    const email = prompt('Parent\'s Email Address:');
    
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
        alert(`✅ Parent Code: ${data.parentCode}\n\nPlease provide this code to the parent to access the Parent Portal.`);
      } else {
        alert('❌ Failed to generate parent code. Please try again!');
      }
    } catch (error) {
      console.error('Error generating parent code:', error);
      alert('❌ An error occurred, please try again!');
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
        alert('Please fill in at least one subject and its grade!');
        return;
    }
    
    if (!resultsData.sendMethod) {
        alert('Please select a method to send the results (Email or SMS)!');
        return;
    }

    setSendingStatus('processing');
    
    // Calculate average and division
    const points = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
    const gradesList = [resultsData.grade1, resultsData.grade2, resultsData.grade3, resultsData.grade4];
    let total = 0, count = 0;
    gradesList.forEach(g => { if (g && g !== '') { total += points[g] || 0; count++; } });
    const average = count > 0 ? (total / count).toFixed(2) : 0;
    const division = average >= 3.5 ? 'I' : average >= 2.5 ? 'II' : average >= 1.5 ? 'III' : 'IV';
    
    try {
        const saveResponse = await fetch(`${API_URL}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: selectedStudent.id,
                subject1: resultsData.subject1, grade1: resultsData.grade1,
                subject2: resultsData.subject2, grade2: resultsData.grade2,
                subject3: resultsData.subject3, grade3: resultsData.grade3,
                subject4: resultsData.subject4, grade4: resultsData.grade4,
                remarks: resultsData.remarks, term: 'Term 1', year: new Date().getFullYear()
            })
        });
        
        const saveData = await saveResponse.json();
        if (!saveData.success) { alert('❌ Failed to save results!'); setSendingStatus(''); return; }
        
        alert(`📊 Results saved successfully!\n\n📈 Average: ${average}\n🏆 Division: ${division}`);
        
        if (resultsData.sendMethod === 'email') {
            if (!selectedStudent.email) { alert('Student has no email address!'); setSendingStatus(''); return; }
            const emailResponse = await fetch(`${API_URL}/send-results`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student: selectedStudent, results: resultsData })
            });
            if ((await emailResponse.json()).success) alert('✅ Results sent via email!');
            else alert('⚠️ Results saved but email failed to send!');
        } 
        else if (resultsData.sendMethod === 'sms') {
            if (!selectedStudent.phone) { alert('Student has no phone number!'); setSendingStatus(''); return; }
            const smsResponse = await fetch(`${API_URL}/send-sms`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student: selectedStudent, results: resultsData })
            });
            if ((await smsResponse.json()).success) alert('✅ Results sent via SMS!');
            else alert('⚠️ Results saved but SMS failed to send!');
        }
        
        setShowModal(false);
        fetchStudents();
    } catch (error) {
        alert('❌ An error occurred, please try again!');
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
    const headers = ["Full Name", "Age", "Gender", "Course", "Phone Number", "Email"];
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
            <p>Register for an account</p>
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
                setParentLoginError('Code is invalid.');
              }
            } catch (error) {
              setParentLoginError('Failed to login. Please try again!');
            }
          }}>
            <div className="form-group">
              <label><i className="fas fa-key"></i> Parent Code</label>
              <input type="text" value={parentCode} onChange={(e) => setParentCode(e.target.value)} placeholder="Enter your code (e.g., 123456)" required />
            </div>
            {parentLoginError && <div className="error-message">{parentLoginError}</div>}
            <button type="submit" className="btn-login">LOGIN</button>
          </form>
          <div className="login-footer">
            <p>Don't have a code? Contact the school for assistance.</p>
            <button onClick={() => setShowParentLogin(false)} className="btn-outline">Back to School Login</button>
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
            <p>Student  Management system</p>
          </div>
          
          {!selectedRole ? (
            <div className="role-selection">
              <h3>Choose Account Type</h3>
              <div className="role-buttons">
                <button type="button" onClick={() => handleRoleSelect('admin')} className="role-btn admin-role">
                  <i className="fas fa-user-shield"></i>
                  <div><strong>Admin</strong><small>Full access to manage</small></div>
                </button>
                <button type="button" onClick={() => handleRoleSelect('user')} className="role-btn user-role">
                  <i className="fas fa-user"></i>
                  <div><strong>Regular User</strong><small>View only (Read only)</small></div>
                </button>
                <button type="button" onClick={() => setShowParentLogin(true)} className="role-btn parent-role">
                  <i className="fas fa-users"></i>
                  <div><strong>Parent / Guardian</strong><small>View your child's results</small></div>
                </button>
              </div>
              <div className="register-link">
                <p>Don't have an account? <button onClick={() => setShowRegister(true)} className="link-btn">Register here</button></p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="role-badge">
                <span className={`role-badge-${selectedRole}`}>
                  <i className={selectedRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
                  {selectedRole === 'admin' ? ' Admin Login' : ' User Login'}
                </span>
                <button type="button" onClick={() => setSelectedRole(null)} className="change-role-btn">Change Role</button>
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
              <button type="submit" className="btn-login">LOGIN</button>
            </form>
          )}
          
          <div className="login-footer">
            <p><strong>Parent:</strong> Enter the code provided by the school</p>
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
          background: 'linear-gradient(90deg, #0051ff, #00ff6a, #00ffdd, #00cc00, #0099ff, #6600cc, #ff00ff)',
          padding: '12px',
          borderRadius: '50px',
          marginBottom: '15px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
         HELLO!  |  WELCOME TO KATWE SECONDARY SCHOOL  |   STUDENT  MANAGEMENT SYSTEM & RESULT |   ENJOY OUR WEBSITE!  |   KARIBU SANA!   |   CALL US: +255 614910462& 0799119250  |  EMAIL: info@katwe.com
      </marquee>
      
      <div className="school-header">
        <div className="user-info">
          <i className={userRole === 'admin' ? 'fas fa-user-shield' : 'fas fa-user'}></i>
          <span><strong>{userName}</strong><small>({userRole === 'admin' ? 'Administrator' : 'Regular User'})</small></span>
        </div>
        <h1><i className="fas fa-graduation-cap"></i> KATWE SECONDARY SCHOOL</h1>
        <p>STUDENT  MANAGEMENT & RESULTS</p>
        
        <div className="toggle-buttons">
          <button className={`toggle-btn ${showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement && !showAnnouncements ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(true); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}>
            <i className="fas fa-chart-line"></i> Dashboard
          </button>
          <button className={`toggle-btn ${!showDashboard && !showTimetable && !showTimetableAdmin && !showUserManagement && !showAnnouncements ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}>
            <i className="fas fa-users"></i> students
          </button>
          <button className={`toggle-btn ${showTimetable ? 'active' : ''}`} 
            onClick={() => { setShowDashboard(false); setShowTimetable(true); setShowTimetableAdmin(true); setShowUserManagement(false); setShowAnnouncements(false); }}>
            <i className="fas fa-calendar-alt"></i> Timetable
          </button>
          
          {userRole === 'admin' && (
            <>
              <button className={`toggle-btn ${showTimetableAdmin ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(true); setShowUserManagement(false); setShowAnnouncements(false); }}>
                <i className="fas fa-cog"></i> Timetable Admin
              </button>
              <button className={`toggle-btn ${showUserManagement ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(true); setShowAnnouncements(false); }}>
                <i className="fas fa-users-cog"></i> User Management
              </button>
              <button className={`toggle-btn ${showAnnouncements ? 'active' : ''}`} 
                onClick={() => { setShowDashboard(false); setShowTimetable(false); setShowTimetableAdmin(false); setShowUserManagement(false); setShowAnnouncements(false); }}>
                <i className="fas fa-bullhorn"></i> Announcements
              </button>
            </>
          )}
        </div>
        <div className="header-buttons">
        {showInstallButton && (
            <button onClick={handleInstallClick} className="install-btn">
                <i className="fas fa-download"></i> Install App
            </button>
        )}
        
        <button onClick={handleLogout} className="logout-btn">LOG OUT</button>
      </div>
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
                <h2>{editingId ? ' EDIT STUDENT' : ' REGISTER STUDENT'}</h2>
                {!canAdd && <span className="permission-badge"><i className="fas fa-lock"></i> Read Only</span>}
              </div>
              <div className="card-body">
                {!canAdd && (
                  <div className="permission-message">
                    <i className="fas fa-info-circle"></i>
                    <p>Sorry, you are a regular user. You do not have permission to add or edit students.</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>FULL NAME *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>AGE *</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>COURSE *</label>
                    <input type="text" name="course" value={formData.course} onChange={handleChange} required disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>GENDER *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required disabled={!canAdd}>
                      <option value="">Select Gender...</option>
                      <option value="MALE">MALE (Male)</option>
                      <option value="FEMALE">FEMALE (Female)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Number (SMS)</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!canAdd} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!canAdd} />
                  </div>
                  
                  <div className="form-group">
                    <label>Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={!canAdd || uploadingPhoto} />
                    {uploadingPhoto && <div className="uploading-text"><i className="fas fa-spinner fa-spin"></i> Uploading photo...</div>}
                    {formData.photo && (
                      <div className="photo-preview">
                        <img src={formData.photo} alt="Student" />
                        <button type="button" onClick={() => setFormData({...formData, photo: ''})} className="btn-remove-photo">Futa Picha</button>
                      </div>
                    )}
                  </div>
                  
                  {canAdd && (
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i> {editingId ? 'UPDATE' : 'SAVE'}
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* ORODHA YA WANAFUNZI */}
            <div className="card">
              <div className="card-header">
                <i className="fas fa-users"></i>
                <h2>📋 FULL LIST OF STUDENTS</h2>
              </div>
              <div className="card-body">
                <div className="search-section">
                  <input type="text" className="search-input" placeholder="🔍 Search by name or course..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <span className="stat-badge">Students {filteredStudents.length}</span>
                </div>
                
                {loading && <div className="loading-spinner">Loading data...</div>}
                
                <div className="table-wrapper">
                  <table className="student-table">
                    <thead>
                      <tr><th>Photo</th><th>NAME</th><th>COURSE</th><th>PHONE</th><th>EMAIL</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 && !loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}> Hakuna wanafunzi waliosajiliwa</td></tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.id}>
                            <td className="photo-cell">
                              {student.photo ? <img src={student.photo} alt={student.fullName} className="student-thumb" /> : <div className="no-photo">photo</div>}
                            </td>
                            <td><strong>{student.fullName}</strong><br/><small>{student.age} yrs | {student.gender}</small></td>
                            <td>{student.course}</td>
                            <td>{student.phone || '—'}</td>
                            <td>{student.email || '—'}</td>
                            <td className="action-buttons">
                              <button className="btn btn-sm btn-primary" onClick={() => openResultsModal(student)}><i className="fas fa-chart-line"></i> Results</button>
                              <button className="btn btn-sm btn-info" onClick={() => downloadStudentReport(student.id)}><i className="fas fa-file-pdf"></i> PDF</button>
                              {canEdit && <button className="btn btn-sm btn-outline" onClick={() => handleEdit(student)}><i className="fas fa-edit"></i> Edit</button>}
                              {canDelete && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}><i className="fas fa-trash-alt"></i> Delete</button>}
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
                  <span><i className="fas fa-download"></i> <strong>Download Reports</strong></span>
                  <div className="download-buttons">
                    <button onClick={downloadCSV} className="btn btn-outline btn-sm">
                      <i className="fas fa-file-csv"></i> CSV
                    </button>
                    <button onClick={downloadAllStudentsReport} className="btn btn-outline btn-sm">
                      <i className="fas fa-file-pdf"></i> All Students PDF
                    </button>
                    <button onClick={() => downloadClassReport('Form 1')} className="btn btn-outline btn-sm">
                      <i className="fas fa-file-pdf"></i> Class Report PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL YA KUJAZA MATOKEO */}
          {showModal && selectedStudent && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
                <div className="modal-header">
                  <h2><i className="fas fa-chart-line"></i> Enter Results - {selectedStudent.fullName}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="results-form">
                    <h3>Subjects 7</h3>

                    {/* Somo 1 */}
                    <div className="form-group">
                      <label>Subject 1</label>
                      <div className="subject-row">
                        <input type="text" name="subject1" placeholder="Subject name" value={resultsData.subject1} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score1" placeholder="Score" value={resultsData.score1} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade1" value={resultsData.grade1} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 2</label>
                      <div className="subject-row">
                        <input type="text" name="subject2" placeholder="Subject name" value={resultsData.subject2} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score2" placeholder="Score" value={resultsData.score2} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade2" value={resultsData.grade2} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 3</label>
                      <div className="subject-row">
                        <input type="text" name="subject3" placeholder="Subject name" value={resultsData.subject3} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score3" placeholder="Score" value={resultsData.score3} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade3" value={resultsData.grade3} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 4</label>
                      <div className="subject-row">
                        <input type="text" name="subject4" placeholder="Subject name" value={resultsData.subject4} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score4" placeholder="Score" value={resultsData.score4} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade4" value={resultsData.grade4} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 5</label>
                      <div className="subject-row">
                        <input type="text" name="subject5" placeholder="Subject name" value={resultsData.subject5} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score5" placeholder="Score" value={resultsData.score5} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade5" value={resultsData.grade5} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 6</label>
                      <div className="subject-row">
                        <input type="text" name="subject6" placeholder="Subject name" value={resultsData.subject6} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score6" placeholder="Score" value={resultsData.score6} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade6" value={resultsData.grade6} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label>Subject 7</label>
                      <div className="subject-row">
                        <input type="text" name="subject7" placeholder="Subject name" value={resultsData.subject7} onChange={handleResultsChange} style={{ flex: 2 }} />
                        <input type="number" name="score7" placeholder="Score" value={resultsData.score7} onChange={handleResultsChange} style={{ width: 80 }} />
                        <select name="grade7" value={resultsData.grade7} onChange={handleResultsChange} style={{ width: 70 }}>
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
                      <label> REMARKS</label>
                      <textarea name="remarks" rows="3" placeholder="Maoni kuhusu mwanafunzi..." value={resultsData.remarks} onChange={handleResultsChange}></textarea>
                    </div>

                    <div className="form-group">
                      <label>ways to send</label>
                      <div className="send-methods">
                        <label className="send-option">
                          <input type="radio" name="sendMethod" value="email" onChange={handleResultsChange} />
                          <i className="fas fa-envelope"></i> send by email
                        </label>
                        <label className="send-option">
                          <input type="radio" name="sendMethod" value="sms" onChange={handleResultsChange} />
                          <i className="fas fa-sms"></i> send by sms
                        </label>
                      </div>
                    </div>

                    {sendingStatus === 'processing' && (
                      <div className="sending-status"><i className="fas fa-spinner fa-spin"></i> sending...</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={handleSendResults} disabled={sendingStatus === 'processing'}>
                    <i className="fas fa-paper-plane"></i> Send Results
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
