import React from 'react';

const PagePlaceholder = ({ title, description, icon }) => (
  <div className="animate-fade-in flex flex-col items-center justify-center" style={{height: '100%', minHeight: '60vh', textAlign: 'center'}}>
    <div className="glass p-8 hover-card" style={{padding: '3rem', maxWidth: '500px'}}>
      <div className="text-gradient mb-4 text-6xl" style={{fontSize: '4rem', display: 'flex', justifyContent: 'center'}}>{icon}</div>
      <h2 className="mb-4">{title}</h2>
      <p className="mb-6">{description}</p>
      <button className="btn btn-secondary">Feature Coming Soon</button>
    </div>
  </div>
);

export const Timetable = () => <PagePlaceholder title="Timetable" description="Manage your weekly classes and recurring events." icon="📅" />;
export const Assignments = () => <PagePlaceholder title="Assignments" description="Keep track of your homework, projects, and deadlines." icon="📝" />;
export const Subjects = () => <PagePlaceholder title="Subjects" description="Organize your study materials by course or subject." icon="📚" />;
export const StudyPlanner = () => <PagePlaceholder title="Study Planner" description="Plan your study sessions for optimal retention." icon="🧠" />;
export const Exams = () => <PagePlaceholder title="Exams" description="Prepare for your upcoming midterms and finals." icon="🎓" />;
export const ProgressTracker = () => <PagePlaceholder title="Progress Tracker" description="Visualize your GPA and academic growth over time." icon="📈" />;
export const AIStudyAssistant = () => <PagePlaceholder title="AI Study Assistant" description="Get personalized study tips and summaries." icon="✨" />;
export const Notes = () => <PagePlaceholder title="Notes & Resources" description="Your centralized hub for class notes and files." icon="📓" />;
export const DailyGoals = () => <PagePlaceholder title="Daily Goals" description="Set and crush your daily academic objectives." icon="🎯" />;
export const Profile = () => <PagePlaceholder title="Student Profile" description="Manage your personal information and preferences." icon="👤" />;
