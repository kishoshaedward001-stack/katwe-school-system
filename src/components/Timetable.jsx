import React, { useState, useEffect } from 'react';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

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

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    fetchTimetable(classId);
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

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
      </div>

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

      {selectedClass && (
        <div className="timetable-display">
          {loading ? (
            <p>Inapakia ratiba...</p>
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

      {classes.length === 0 && (
        <div className="no-data">
          <p>Hakuna darasa lililoongezwa bado. Admin ataongeza darasa.</p>
        </div>
      )}
    </div>
  );
};

export default Timetable;