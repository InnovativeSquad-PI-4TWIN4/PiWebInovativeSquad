import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FaEdit, FaTrash, FaDownload, FaSun, FaMoon } from 'react-icons/fa';
import './schedule.scss';

const Schedule = () => {
  const [workSchedule, setWorkSchedule] = useState('');
  const [learningSchedule, setLearningSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const generateLearningSchedule = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const [workStart, workEnd] = workSchedule.split('-').map((time) => time.trim());
        const workStartTime = new Date(`1970-01-01T${workStart}:00`);
        const workEndTime = new Date(`1970-01-01T${workEnd}:00`);

        const freeTimeSlots = [
          { start: '06:00', end: workStart },
          { start: workEnd, end: '23:00' },
        ];

        const tasks = [];
        freeTimeSlots.forEach((slot) => {
          const startTime = new Date(`1970-01-01T${slot.start}:00`);
          const endTime = new Date(`1970-01-01T${slot.end}:00`);

          let currentTime = startTime;
          while (currentTime < endTime) {
            const taskEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
            if (taskEndTime > endTime) break;

            tasks.push({
              id: tasks.length + 1,
              task: `Learning Session ${tasks.length + 1}`,
              time: `${currentTime.toTimeString().slice(0, 5)} - ${taskEndTime.toTimeString().slice(0, 5)}`,
              completed: false,
            });

            currentTime = taskEndTime;
          }
        });

        setLearningSchedule(tasks);
      } catch (error) {
        console.error('Error generating schedule:', error);
        alert('Invalid work schedule format. Please use "HH:mm - HH:mm".');
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const fileName = 'Learning_Schedule.pdf';
      
      doc.setFontSize(20);
      doc.setTextColor(0, 255, 136); // Neon green
      doc.text('Learning Schedule', 15, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);

      const tableData = learningSchedule.map((item) => [
        item.id,
        item.task,
        item.time,
        item.completed ? '✅' : '❌'
      ]);

      doc.autoTable({
        head: [['#', 'Task', 'Time', 'Completed']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 20, 30],
          textColor: [0, 255, 136],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [200, 200, 200],
          fillColor: [20, 20, 30]
        },
        alternateRowStyles: {
          fillColor: [30, 30, 40]
        }
      });

      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const toggleCompletion = (id) => {
    setLearningSchedule((prevSchedule) =>
      prevSchedule.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setLearningSchedule((prevSchedule) => prevSchedule.filter((task) => task.id !== id));
  };

  const editTask = (id, newTask) => {
    setLearningSchedule((prevSchedule) =>
      prevSchedule.map((task) =>
        task.id === id ? { ...task, task: newTask } : task
      )
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`schedule-generator ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="header">
        <h2>Learning Schedule Generator</h2>
        {/*
<button onClick={toggleDarkMode} className="mode-toggle">
  {isDarkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
</button>
*/}
      </div>
      
      <div className="input-section">
        <label htmlFor="work-schedule">
          <span className="label-text">Enter your work schedule</span>
          <span className="label-example">(e.g., 14:00 - 18:00)</span>
        </label>
        <input
          id="work-schedule"
          type="text"
          placeholder="14:00 - 18:00"
          value={workSchedule}
          onChange={(e) => setWorkSchedule(e.target.value)}
          className="cyber-input"
        />
      </div>
      
      <button 
        onClick={generateLearningSchedule} 
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : 'Generate Learning Schedule'}
      </button>

      {learningSchedule.length > 0 && (
        <div className="schedule-result">
          <div className="schedule-header">
            <h3>Your Learning Schedule</h3>
            <button onClick={downloadPDF} className="download-button">
              <FaDownload className="download-icon" /> 
              <span>Download as PDF</span>
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {learningSchedule.map((item) => (
                  <tr key={item.id} className={item.completed ? 'completed' : ''}>
                    <td className="task-id">{item.id}</td>
                    <td className="task-name">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => editTask(item.id, e.target.value)}
                        className="cyber-input"
                      />
                    </td>
                    <td className="task-time">{item.time}</td>
                    <td className="task-status">
                      <button 
                        onClick={() => toggleCompletion(item.id)}
                        className={`status-toggle ${item.completed ? 'completed' : ''}`}
                      >
                        {item.completed ? '✓' : '✗'}
                      </button>
                    </td>
                    <td className="task-actions">
                      <button 
                        onClick={() => deleteTask(item.id)}
                        className="delete-button"
                      >
                        <FaTrash className="trash-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;