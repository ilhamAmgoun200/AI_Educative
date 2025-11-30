"""
Modèles de base de données
"""
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.subject import Subject
from app.models.course import Course, CourseFile
from app.models.exercise import Exercise
from app.models.course_explanation import CourseExplanation
from app.models.student_progress import StudentProgress
from app.models.chat_message import ChatMessage

__all__ = ['Teacher', 'Student', 'Subject', 'Course', 'CourseFile', 'Exercise', 'CourseExplanation', 'StudentProgress','ChatMessage']