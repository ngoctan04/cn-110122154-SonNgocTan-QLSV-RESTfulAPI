import User from '../model/userModel.js';
import Class from '../model/classModel.js';
import Major from '../model/majorModel.js';
import Course from '../model/courseModel.js';
import Grade from '../model/gradeModel.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalMajors = await Major.countDocuments();
    const totalCourses = await Course.countDocuments();

    // GPA & học lực
    const grades = await Grade.find();
    let gpaSum = 0;
    let gpaCount = 0;
    let excellent = 0;
    let weak = 0;
    const studentGPA = {};
    grades.forEach(g => {
      if (!studentGPA[g.userId]) studentGPA[g.userId] = [];
      studentGPA[g.userId].push(g.score);
    });
    Object.values(studentGPA).forEach(scores => {
      if (scores.length) {
        const gpa = scores.reduce((a, b) => a + b, 0) / scores.length;
        gpaSum += gpa;
        gpaCount++;
        if (gpa >= 8) excellent++;
        if (gpa < 5) weak++;
      }
    });
    const avgGPA = gpaCount ? gpaSum / gpaCount : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalClasses,
        totalMajors,
        totalCourses,
        avgGPA,
        excellent,
        weak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
