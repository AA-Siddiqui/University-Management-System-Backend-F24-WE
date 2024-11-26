INSERT INTO Department (name) 
VALUES 
    ('Software Engineering'),
    ('Computer Science'),
    ('Information Technology');

INSERT INTO User (departmentIDDepartmentID, name, email, gender, dob, phone, emergencyPhone, address, joinDate, role, username, password)
VALUES
    (1, 'John Doe', 'johndoe@example.com', 'Male', '1990-05-15', '1234567890', '0987654321', '123 Main St, Cityville', '2020-01-10', 1, 'student', ''),
    (1, 'Jane Smith', 'janesmith@example.com', 'Female', '1985-07-20', '1234567891', '0987654322', '456 Maple St, Townsville', '2021-03-15', 2, 'teacher', ''),
    (1, 'Alice Johnson', 'alicejohnson@example.com', 'Female', '1993-02-25', '1234567892', '0987654323', '789 Oak St, Villageville', '2019-09-01', 3, 'admin', ''),
    (1, 'Cat Johnson', 'alicejohnson@example.com', 'Female', '1993-02-25', '1234567892', '0987654323', '789 Oak St, Villageville', '2019-09-01', 1, 'student0', ''),
    (2, 'Dog Johnson', 'alicejohnson@example.com', 'Female', '1993-02-25', '1234567892', '0987654323', '789 Oak St, Villageville', '2019-09-01', 1, 'student1', ''),
    (1, 'Teacher Johnson', 'alicejohnson@example.com', 'Female', '1993-02-25', '1234567892', '0987654323', '789 Oak St, Villageville', '2019-09-01', 2, 'teacher0', '');

INSERT INTO Program (name, level, departmentIDDepartmentID, totalCreditHrs) 
VALUES 
    ('Bachelors of Software Engineering', 'Bachelor', 1, 133),
    ('Bachelors of Artificial Intelligence', 'Bachelor', 1, 133),
    ('Bachelors of Computer Science', 'Bachelor', 2, 133);

INSERT INTO Course (name, creditHr, mode)
VALUES 
    ('PF (Theory)', 3, 'Lecture'),
    ('PF (Lab)', 1, 'Lab'),
    ('Web Engineering', 3, 'Lecture');

INSERT INTO Admin (userIDUserID)
VALUES
    (3);

INSERT INTO Teacher (userIDUserID, position, officeLocation)
VALUES
    (2, 'lecturer', 'Office 1'),
    (6, 'lecturer', 'Office 2');

INSERT INTO Student (userIDUserID, programIDProgramID, rollNo)
VALUES
    (1, 1, 'BS-SE-F24-001'),
    (4, 2, 'BS-AI-F24-001'),
    (5, 3, 'BS-CS-F24-001');

INSERT INTO Class (teacherIDTeacherID, courseIDCourseID, term, section) 
VALUES
    (1, 1, 'Fall 2024', 'A'),
    (2, 2, 'Spring 2024', 'B'),
    (1, 3, 'Summer 2024', 'C');

INSERT INTO Assessment (classIDClassID, title, description, deadline, max, weight)
VALUES
    (1, 'Midterm Exam', 'A comprehensive midterm exam covering topics 1-5.', '2024-10-15 10:00:00', 10, 20),
    (1, 'Final Project', 'A final project based on course material and group work.', '2024-12-01 23:59:59', 10, 40),
    (2, 'Lab Report', 'Lab report submission on experiments conducted in class.', '2024-09-30 17:00:00', 10, 10),
    (2, 'Quiz 1', 'A quiz on introductory topics in biology.', '2024-09-20 09:00:00', 10, 10);

INSERT INTO Submission (studentIDStudentID, assessmentIDAssessmentID, marks)
VALUES
    (1, 1, 10),
    (1, 2, 10),
    (2, 1, 7),
    (3, 2, -1);

INSERT INTO Schedule (classIDClassID, startTime, endTime, venue)
VALUES
    (1, '2024-09-01 09:00:00', '2024-09-01 10:30:00', 'Room 25'),
    (2, '2024-09-01 11:00:00', '2024-09-01 12:30:00', 'Room 25'),
    (3, '2024-09-02 14:00:00', '2024-09-02 15:30:00', 'Room 25'),
    (1, '2024-11-26 14:00:00', '2024-11-26 15:30:00', 'Room 25');

INSERT INTO Assessment_file (assessmentIDAssessmentID, name)
VALUES
    (1, 'Midterm_Exam_Questions.pdf'),
    (2, 'Final_Project_Guidelines.docx'),
    (3, 'Lab_Report_Template.xlsx'),
    (4, 'Quiz_1_Questions.pdf');

INSERT INTO Attendance (scheduleIDScheduleID, studentIDStudentID)
VALUES
    (1, 1),
    (1, 2);

INSERT INTO Enrollment (studentIDStudentID, classIDClassID) 
VALUES
    (1, 1),
    (2, 1),
    (1, 2);

INSERT INTO Invoice (studentIDStudentID, description, amount, dueDate, paidDate, term)
VALUES
    (1, 'Fine',  500, '2024-11-11', '2024-11-12', 'Spring 24'),
    (1, 'Fee', 40000, '2024-10-10', '2024-10-12', 'Spring 24'),
    (2, 'Fee', 40000, '2024-10-10', '2024-10-12', 'Spring 24');

INSERT INTO Request (studentIDStudentID, classIDClassID, approved) 
VALUES
    (3, 1, NULL),
    (3, 3, TRUE),
    (3, 2, FALSE);

INSERT INTO Submission_file (submissionIDSubmissionID, name)
VALUES
    (1, 'Midterm_Exam_Submission.pdf'),
    (2, 'Midterm_Exam_Submission.docx'),
    (3, 'Final_Project_Presentation.pptx');


Department
Program
User
Admin
Teacher
Student
Invoice
Course
Class
Enrollment
Request
Schedule
Assessment