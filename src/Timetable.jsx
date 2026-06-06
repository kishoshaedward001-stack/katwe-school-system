import React, { useState, useEffect } from 'react';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '09:00',
    subject: '',
    teacher: '',
    room: ''
  });
  const [newClass, setNewClass] = useState({ className: '', description: '' });
  const [showClassForm, setShowClassForm] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      const response = await fetch(`${API_URL}/timetable/${classId}`);
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    fetchTimetable(classId);
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Darasa limeongezwa!');
        fetchClasses();
        setNewClass({ className: '', description: '' });
        setShowClassForm(false);
      }
    } catch (error) {
      alert('❌ Imeshindwa kuongeza darasa');
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, classId: selectedClass })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Ratiba imeongezwa!');
        fetchTimetable(selectedClass);
        setShowForm(false);
        setFormData({
          dayOfWeek: 'MONDAY',
          startTime: '08:00',
          endTime: '09:00',
          subject: '',
          teacher: '',
          room: ''
        });
      }
    } catch (error) {
      alert('❌ Imeshindwa kuongeza ratiba');
    }
  };

  const getTimetableForDay = (day) => {
    return timetable.filter(entry => entry.dayofweek === day);
  };

  const getEntryForTime = (entries, time) => {
    return entries.find(entry => entry.starttime === time);
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h2><i className="fas fa-calendar-alt"></i> Ratiba ya Masomo</h2>
        <button onClick={() => setShowClassForm(true)} className="btn btn-primary">
          <i className="fas fa-plus"></i> Ongeza Darasa
        </button>
      </div>

      {/* Class Selection */}
      <div className="class-selector">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => handleClassSelect(cls.id)}
            className={`class-btn ${selectedClass === cls.id ? 'active' : ''}`}
          >
            {cls.classname}
          </button>
        ))}
      </div>

      {/* Add Class Form */}
      {showClassForm && (
        <div className="modal-overlay" onClick={() => setShowClassForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ongeza Darasa Jipya</h3>
            <form onSubmit={handleAddClass}>
              <input
                type="text"
                placeholder="Jina la darasa (Form 1, Form 2, etc.)"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                required
              />
              <textarea
                placeholder="Maelezo (optional)"
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Hifadhi</button>
              <button type="button" onClick={() => setShowClassForm(false)} className="btn btn-outline">Ghairi</button>
            </form>
          </div>
        </div>
      )}

      {/* Timetable Display */}
      {selectedClass && (
        <div className="timetable-display">
          <div className="timetable-toolbar">
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <i className="fas fa-plus"></i> Ongeza Saa za Masomo
            </button>
          </div>

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
                    <td className="time-slot">{time}</td>
                    {days.map(day => {
                      const entries = getTimetableForDay(day);
                      const entry = getEntryForTime(entries, time);
                      return (
                        <td key={day} className="subject-cell">
                          {entry ? (
                            <div className="subject-info">
                              <strong>{entry.subject}</strong>
                              {entry.teacher && <small>{entry.teacher}</small>}
                              {entry.room && <small>Rm: {entry.room}</small>}
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
        </div>
      )}

      {/* Add Timetable Entry Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Ongeza Saa za Masomo</h3>
            <form onSubmit={handleAddEntry}>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Somo (Math, English, etc.)"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Jina la Mwalimu"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              />
              <input
                type="text"
                placeholder="Namba ya Darasa"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Hifadhi</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Ghairi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;