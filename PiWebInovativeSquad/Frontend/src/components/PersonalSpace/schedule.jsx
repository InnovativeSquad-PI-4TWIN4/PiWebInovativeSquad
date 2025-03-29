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

  // Function to generate a learning schedule based on work schedule
  const generateLearningSchedule = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const [workStart, workEnd] = workSchedule.split('-').map((time) => time.trim());
        const workStartTime = new Date(`1970-01-01T${workStart}:00`);
        const workEndTime = new Date(`1970-01-01T${workEnd}:00`);

        // Define free time slots
        const freeTimeSlots = [
          { start: '06:00', end: workStart }, // Morning free time
          { start: workEnd, end: '23:00' }, // Evening free time
        ];

        // Generate learning tasks for free time
        const tasks = [];
        freeTimeSlots.forEach((slot) => {
          const startTime = new Date(`1970-01-01T${slot.start}:00`);
          const endTime = new Date(`1970-01-01T${slot.end}:00`);

          let currentTime = startTime;
          while (currentTime < endTime) {
            const taskEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1-hour tasks
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

  // Function to download the schedule as a PDF
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const fileName = 'Learning_Schedule.pdf';

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 150, 136); // Teal color
      doc.text('Learning Schedule', 15, 20);

      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100); // Grey color
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);

      // Prepare data for the table
      const tableData = learningSchedule.map((item) => [item.id, item.task, item.time, item.completed ? '✅' : '❌']);

      // Add table
      doc.autoTable({
        head: [['#', 'Task', 'Time', 'Completed']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 136], textColor: [255, 255, 255] }, // Teal header
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Light grey alternate rows
      });

      // Save the PDF
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Function to toggle task completion
  const toggleCompletion = (id) => {
    setLearningSchedule((prevSchedule) =>
      prevSchedule.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Function to delete a task
  const deleteTask = (id) => {
    setLearningSchedule((prevSchedule) => prevSchedule.filter((task) => task.id !== id));
  };

  // Function to edit a task
  const editTask = (id, newTask) => {
    setLearningSchedule((prevSchedule) =>
      prevSchedule.map((task) =>
        task.id === id ? { ...task, task: newTask } : task
      )
    );
  };

  // Function to toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`roadmap-generator ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="header">
        <h2>Learning Schedule Generator</h2>
        <button onClick={toggleDarkMode} className="mode-toggle">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <div className="input-section">
        <label htmlFor="work-schedule">Enter your work schedule (e.g., 14:00 - 18:00):</label>
        <input
          id="work-schedule"
          type="text"
          placeholder="14:00 - 18:00"
          value={workSchedule}
          onChange={(e) => setWorkSchedule(e.target.value)}
        />
      </div>
      <button onClick={generateLearningSchedule} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Learning Schedule'}
      </button>

      {learningSchedule.length > 0 && (
        <div className="schedule-result">
          <h3>Your Learning Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>Time</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {learningSchedule.map((item) => (
                <tr key={item.id} className={item.completed ? 'completed' : ''}>
                  <td>{item.id}</td>
                  <td>
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => editTask(item.id, e.target.value)}
                    />
                  </td>
                  <td>{item.time}</td>
                  <td>
                    <button onClick={() => toggleCompletion(item.id)}>
                      {item.completed ? '✅' : '❌'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => deleteTask(item.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={downloadPDF} className="download-button">
            <FaDownload /> Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Schedule;