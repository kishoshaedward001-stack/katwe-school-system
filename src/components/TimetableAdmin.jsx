import React, { useState, useEffect } from 'react';

const TimetableAdmin = () => {
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [classData, setClassData] = useState({ className: '', description: '' });
  const [entryData, setEntryData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '09:00',
    subject: '',
    teacher: '',
    room: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      const data = await response.json();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTimetable = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/timetable/${classId}`);
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Darasa limeongezwa!');
        fetchClasses();
        setClassData({ className: '', description: '' });
        setShowClassForm(false);
      }
    } catch (error) {
      alert('❌ Imeshindwa kuongeza darasa');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Je, una uhakika unataka kufuta darasa hili?')) {
      try {
        await fetch(`${API_URL}/classes/${classId}`, { method: 'DELETE' });
        alert('✅ Darasa limefutwa!');
        fetchClasses();
        if (selectedClass === classId) {
          setSelectedClass(null);
        }
      } catch (error) {
        alert('❌ Imeshindwa kufuta darasa');
      }
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entryData, classId: selectedClass })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Saa imeongezwa!');
        fetchTimetable(selectedClass);
        setEntryData({
          dayOfWeek: 'MONDAY',
          startTime: '08:00',
          endTime: '09:00',
          subject: '',
          teacher: '',
          room: ''
        });
        setShowEntryForm(false);
      }
    } catch (error) {
      alert('❌ Imeshindwa kuongeza saa');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Je, una uhakika unataka kufuta saa hii?')) {
      try {
        await fetch(`${API_URL}/timetable/${entryId}`, { method: 'DELETE' });
        alert('✅ Saa imefutwa!');
        fetchTimetable(selectedClass);
      } catch (error) {
        alert('❌ Imeshindwa kufuta saa');
      }
    }
  };

  const getEntriesForDay = (day) => {
    return timetable.filter(entry => entry.dayofweek === day);
  };

  const getEntryForTime = (entries, time) => {
    return entries.find(entry => entry.starttime === time);
  };

  return (
    <div className="timetable-admin-container">
      <div className="admin-header">
        <h2><i className="fas fa-calendar-alt"></i> Admin - Usimamizi wa Ratiba</h2>
        <button onClick={() => setShowClassForm(true)} className="btn btn-primary">
          <i className="fas fa-plus"></i> Ongeza Darasa
        </button>
      </div>

      {/* Class List */}
      <div className="class-list">
        <h3>Madarasa</h3>
        <div className="class-buttons">
          {classes.map(cls => (
            <div key={cls.id} className="class-item">
              <button
                onClick={() => setSelectedClass(cls.id)}
                className={`class-btn ${selectedClass === cls.id ? 'active' : ''}`}
              >
                {cls.classname}
              </button>
              <button onClick={() => handleDeleteClass(cls.id)} className="delete-class-btn">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Class Form Modal */}
      {showClassForm && (
        <div className="modal-overlay" onClick={() => setShowClassForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ongeza Darasa Jipya</h3>
            <form onSubmit={handleAddClass}>
              <input
                type="text"
                placeholder="Jina la darasa (Form 1, Form 2, etc.)"
                value={classData.className}
                onChange={(e) => setClassData({ ...classData, className: e.target.value })}
                required
              />
              <textarea
                placeholder="Maelezo (optional)"
                value={classData.description}
                onChange={(e) => setClassData({ ...classData, description: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Hifadhi</button>
              <button type="button" onClick={() => setShowClassForm(false)} className="btn btn-outline">Ghairi</button>
            </form>
          </div>
        </div>
      )}

      {/* Timetable Display */}
      {selectedClass && (
        <div className="timetable-section">
          <div className="timetable-toolbar">
            <h3>Ratiba ya {classes.find(c => c.id === selectedClass)?.classname}</h3>
            <button onClick={() => setShowEntryForm(true)} className="btn btn-primary">
              <i className="fas fa-plus"></i> Ongeza Saa
            </button>
          </div>

          {loading ? (
            <p>Inapakia...</p>
          ) : (
            <div className="timetable-grid">
              <table className="timetable-table">
                <thead>
                  <tr>
                    <th>Time / Day</th>
                    {days.map(day => (
                      <th key={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="time-slot">{time} - {parseInt(time) + 1}:00</td>
                      {days.map(day => {
                        const entries = getEntriesForDay(day);
                        const entry = getEntryForTime(entries, time);
                        return (
                          <td key={day} className="subject-cell">
                            {entry ? (
                              <div className="subject-info">
                                <strong>{entry.subject}</strong>
                                <small>{entry.teacher || 'No teacher'}</small>
                                <small>Rm: {entry.room || '-'}</small>
                                <button onClick={() => handleDeleteEntry(entry.id)} className="delete-entry-btn">
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            ) : (
                              <span className="empty-slot">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Entry Form Modal */}
      {showEntryForm && (
        <div className="modal-overlay" onClick={() => setShowEntryForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ongeza Saa za Masomo</h3>
            <form onSubmit={handleAddEntry}>
              <select
                value={entryData.dayOfWeek}
                onChange={(e) => setEntryData({ ...entryData, dayOfWeek: e.target.value })}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              
              <div className="time-row">
                <input
                  type="time"
                  value={entryData.startTime}
                  onChange={(e) => setEntryData({ ...entryData, startTime: e.target.value })}
                  required
                />
                <span> - </span>
                <input
                  type="time"
                  value={entryData.endTime}
                  onChange={(e) => setEntryData({ ...entryData, endTime: e.target.value })}
                  required
                />
              </div>
              
              <input
                type="text"
                placeholder="Somo (Mathematics, English, etc.)"
                value={entryData.subject}
                onChange={(e) => setEntryData({ ...entryData, subject: e.target.value })}
                required
              />
              
              <input
                type="text"
                placeholder="Jina la Mwalimu"
                value={entryData.teacher}
                onChange={(e) => setEntryData({ ...entryData, teacher: e.target.value })}
              />
              
              <input
                type="text"
                placeholder="Namba ya Darasa (Rm 101)"
                value={entryData.room}
                onChange={(e) => setEntryData({ ...entryData, room: e.target.value })}
              />
              
              <button type="submit" className="btn btn-primary">Hifadhi</button>
              <button type="button" onClick={() => setShowEntryForm(false)} className="btn btn-outline">Ghairi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableAdmin;