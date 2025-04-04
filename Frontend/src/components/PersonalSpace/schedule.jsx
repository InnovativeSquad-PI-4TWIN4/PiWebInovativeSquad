import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
// Import jspdf-autotable properly
import 'jspdf-autotable';
import { FaDownload, FaRegCalendarAlt } from 'react-icons/fa';
import { GiBrain, GiSandsOfTime } from 'react-icons/gi';
import './schedule.scss';

const Schedule = () => {
  const [workSchedule, setWorkSchedule] = useState({
    monday: { start: '09:00', end: '17:00', working: true },
    tuesday: { start: '09:00', end: '17:00', working: true },
    wednesday: { start: '09:00', end: '17:00', working: true },
    thursday: { start: '09:00', end: '17:00', working: true },
    friday: { start: '09:00', end: '17:00', working: true },
    saturday: { start: '10:00', end: '14:00', working: false },
    sunday: { start: '', end: '', working: false }
  });
  
  const [learningSchedule, setLearningSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLearningHours, setTotalLearningHours] = useState(0);
  const [preferences, setPreferences] = useState({
    dailyMaxHours: 3,
    weeklyTarget: 15,
    noStudyAfter: '22:00',
    noStudyBefore: '06:00'
  });

  const calculateFreeSlots = (day) => {
    if (day === 'sunday') return [];
    
    const daySchedule = workSchedule[day];
    if (!daySchedule.working) {
      return [{ start: preferences.noStudyBefore, end: preferences.noStudyAfter }];
    }

    const slots = [];
    
    if (daySchedule.start > preferences.noStudyBefore) {
      slots.push({
        start: preferences.noStudyBefore,
        end: daySchedule.start
      });
    }
    
    if (daySchedule.end < preferences.noStudyAfter) {
      slots.push({
        start: daySchedule.end,
        end: preferences.noStudyAfter
      });
    }
    
    return slots;
  };

  const generateLearningSchedule = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const tasks = [];
        let hoursScheduled = 0;
        const targetHours = Math.min(Math.max(preferences.weeklyTarget, 5), 96);
        
        days.forEach(day => {
          const freeSlots = calculateFreeSlots(day);
          
          freeSlots.forEach(slot => {
            const startTime = new Date(`1970-01-01T${slot.start}:00`);
            const endTime = new Date(`1970-01-01T${slot.end}:00`);
            
            let currentTime = startTime;
            while (currentTime < endTime && hoursScheduled < targetHours) {
              const sessionEnd = new Date(currentTime.getTime() + 60 * 60 * 1000);
              if (sessionEnd > endTime) break;
              
              const endHour = parseInt(slot.end.split(':')[0]);
              if (endHour >= 22 && sessionEnd.getHours() >= 22) break;
              
              tasks.push({
                id: `${day}-${tasks.length + 1}`,
                day: day.charAt(0).toUpperCase() + day.slice(1),
                task: `Learning Session ${tasks.length + 1}`,
                startTime: currentTime.toTimeString().slice(0, 5),
                endTime: sessionEnd.toTimeString().slice(0, 5),
                duration: 1,
                completed: false
              });
              
              currentTime = sessionEnd;
              hoursScheduled += 1;
              
              const dayTasks = tasks.filter(t => t.day.toLowerCase() === day);
              if (dayTasks.length >= preferences.dailyMaxHours) break;
            }
          });
        });
        
        setLearningSchedule(tasks);
        setTotalLearningHours(hoursScheduled);
      } catch (error) {
        console.error('Error generating schedule:', error);
        alert('Error generating schedule. Please check your inputs.');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const downloadPDF = () => {
    try {
      // Check if there are items to put in the PDF
      if (learningSchedule.length === 0) {
        alert('No schedule items to download. Generate a learning plan first.');
        return;
      }
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title and metadata
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(110, 86, 207); // Primary purple
      doc.text('Learning Schedule', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(76, 201, 240); // Secondary blue
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Add stats section
      doc.setFontSize(14);
      doc.setTextColor(110, 86, 207); // Primary purple
      doc.text(`Total Learning Hours: ${totalLearningHours}h`, 14, 45);
      doc.text(`Weekly Target: ${preferences.weeklyTarget}h`, 14, 55);

      // Prepare table data
      const tableData = learningSchedule.map((item, index) => [
        index + 1,
        item.day,
        item.task,
        `${item.startTime} - ${item.endTime}`,
        `${item.duration}h`,
        item.completed ? '✓' : '✗'
      ]);

      // Use try-catch specifically for the autoTable call
      try {
        // Add the table
        doc.autoTable({
          startY: 65,
          head: [['#', 'Day', 'Task', 'Time', 'Duration']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [30, 41, 59], // background-light
            textColor: [249, 250, 251], // text-color
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: [30, 41, 59], // dark text
          },
          alternateRowStyles: {
            fillColor: [236, 239, 244] // lighter background
          },
          margin: { left: 14 }
        });
      } catch (tableError) {
        console.error('Error in autoTable:', tableError);
        
        // Fallback to basic table if autoTable fails
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Draw header
        const headers = ['#', 'Day', 'Task', 'Time', 'Duration'];
        const colWidth = 40;
        let yPos = 65;
        
        headers.forEach((header, i) => {
          doc.text(header, 14 + (i * colWidth), yPos);
        });
        
        yPos += 8;
        
        // Draw rows
        tableData.forEach((row, i) => {
          row.forEach((cell, j) => {
            doc.text(String(cell), 14 + (j * colWidth), yPos);
          });
          yPos += 8;
        });
      }

      // Save the PDF
      doc.save(`Learning_Schedule_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
  };

  const toggleCompletion = (id) => {
    setLearningSchedule(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleWorkTimeChange = (day, field, value) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const toggleWorkingDay = (day) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], working: !prev[day].working }
    }));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="title-container">
          <GiBrain className="brain-icon" />
          <h1 className="dashboard-title">
            Learning <span className="dashboard-title">Scheduler</span>
          </h1>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="glass-panel">
          <div className="section-header">
            <FaRegCalendarAlt className="section-icon" />
            <h2>Your Work Schedule</h2>
          </div>
          
          <div className="preferences-card">
            <div className="preference-item">
              <label>Weekly Learning Target (hours)</label>
              <input 
                type="number" 
                min="5" 
                max="96" 
                value={preferences.weeklyTarget}
                onChange={(e) => setPreferences({...preferences, weeklyTarget: parseInt(e.target.value) || 15})}
              />
            </div>
            
            <div className="preference-item">
              <label>Max Daily Learning (hours)</label>
              <input 
                type="number" 
                min="1" 
                max="8" 
                value={preferences.dailyMaxHours}
                onChange={(e) => setPreferences({...preferences, dailyMaxHours: parseInt(e.target.value) || 3})}
              />
            </div>
          </div>
          
          <div className="work-days-grid">
            {Object.entries(workSchedule).map(([day, schedule]) => (
              <div key={day} className={`work-day-card ${day === 'sunday' ? 'rest-day' : ''}`}>
                <div className="day-header">
                  <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  {day !== 'sunday' && (
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={schedule.working}
                        onChange={() => toggleWorkingDay(day)}
                      />
                      <span className="slider"></span>
                    </label>
                  )}
                </div>
                
                {schedule.working && day !== 'sunday' ? (
                  <div className="time-inputs">
                    <div className="time-input">
                      <label>Start</label>
                      <input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handleWorkTimeChange(day, 'start', e.target.value)}
                        disabled={!schedule.working}
                      />
                    </div>
                    <div className="time-input">
                      <label>End</label>
                      <input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handleWorkTimeChange(day, 'end', e.target.value)}
                        disabled={!schedule.working}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="day-off">
                    {day === 'sunday' ? 'Rest Day' : 'Day Off'}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={generateLearningSchedule} 
            disabled={isLoading}
            className="generate-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Generating Schedule...
              </>
            ) : (
              <>
                <GiSandsOfTime className="btn-icon" />
                Generate Learning Plan
              </>
            )}
          </button>

          {learningSchedule.length > 0 && (
            <div className="schedule-section">
              <div className="section-header">
                <div className="header-content">
                  <h2>Your Learning Schedule</h2>
                  <div className="schedule-stats">
                    <span className="stat-item">
                      <span className="stat-label">Total Hours:</span>
                      <span className="stat-value">{totalLearningHours}h</span>
                    </span>
                    <span className="stat-item">
                      <span className="stat-label">Target:</span>
                      <span className="stat-value">{preferences.weeklyTarget}h</span>
                    </span>
                    <span className="stat-item">
                      <span className="stat-label">Sessions:</span>
                      <span className="stat-value">{learningSchedule.length}</span>
                    </span>
                  </div>
                </div>
                <button onClick={downloadPDF} className="download-btn">
                  <FaDownload className="btn-icon" />
                  Download Schedule
                </button>
              </div>
              
              <div className="schedule-visualization">
                <div className="days-tabs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <button 
                      key={day} 
                      className={`day-tab ${learningSchedule.some(s => s.day.startsWith(day)) ? 'has-sessions' : ''}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                
                <div className="table-container">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const time = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <tr key={time}>
                            <td className="time-label">{time}</td>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                              const session = learningSchedule.find(s => 
                                s.day === day && 
                                parseInt(s.startTime.split(':')[0]) <= hour && 
                                parseInt(s.endTime.split(':')[0]) > hour
                              );
                              
                              return (
                                <td 
                                  key={`${day}-${time}`} 
                                  className={`time-slot ${session ? 'booked' : ''} ${session?.completed ? 'completed' : ''}`}
                                  onClick={() => session && toggleCompletion(session.id)}
                                >
                                  {session && (
                                    <div className="session-block">
                                      <span className="session-title">{session.task}</span>
                                      <span className="session-time">{session.startTime}-{session.endTime}</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;