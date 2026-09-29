import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, CheckCircle, Clock, BookOpen, BarChart, Target, Award } from 'lucide-react';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [assignments, setAssignments] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [subjectStats, setSubjectStats] = useState({});

  useEffect(() => {
    if (user) fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    setLoading(true);
    setError('');
    
    const [assignmentsRes, studyPlansRes, subjectsRes] = await Promise.all([
      supabase.from('assignments').select('*').eq('user_id', user.id),
      supabase.from('study_plans').select('*').eq('user_id', user.id),
      supabase.from('subjects').select('name').eq('user_id', user.id)
    ]);

    let errorMsg = '';
    if (assignmentsRes.error) errorMsg += `Assignments Error: ${assignmentsRes.error.message}. `;
    if (studyPlansRes.error) errorMsg += `Study Plans Error: ${studyPlansRes.error.message}. `;
    if (subjectsRes.error) errorMsg += `Subjects Error: ${subjectsRes.error.message}. `;

    if (errorMsg) {
      setError(errorMsg.trim());
      setLoading(false);
      return;
    }

    const assignmentsData = assignmentsRes.data || [];
    const studyPlansData = studyPlansRes.data || [];
    
    setAssignments(assignmentsData);
    setStudyPlans(studyPlansData);

    const subjectsMap = {};
    // Initialize map with known subjects
    if (subjectsRes.data) {
      subjectsRes.data.forEach(s => {
        subjectsMap[s.name] = { plannedHours: 0, completedHours: 0, completedAssignments: 0, totalAssignments: 0 };
      });
    }

    const todayStr = new Date().toLocaleDateString('en-CA');

    // Aggregate Assignment Data
    assignmentsData.forEach(a => {
      if (!subjectsMap[a.subject]) {
        subjectsMap[a.subject] = { plannedHours: 0, completedHours: 0, completedAssignments: 0, totalAssignments: 0 };
      }
      subjectsMap[a.subject].totalAssignments++;
      if (a.status === 'Completed') {
        subjectsMap[a.subject].completedAssignments++;
      }
    });

    // Aggregate Study Plan Data
    studyPlansData.forEach(sp => {
      if (!subjectsMap[sp.subject]) {
        subjectsMap[sp.subject] = { plannedHours: 0, completedHours: 0, completedAssignments: 0, totalAssignments: 0 };
      }
      const hours = sp.duration / 60;
      subjectsMap[sp.subject].plannedHours += hours;
      // We consider past and today's sessions as "completed" for progress purposes
      if (sp.study_date <= todayStr) {
        subjectsMap[sp.subject].completedHours += hours;
      }
    });

    setSubjectStats(subjectsMap);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center w-full h-full" style={{minHeight: '50vh'}}>
      <div className="text-gradient">Calculating Progress...</div>
    </div>
  );

  const todayStr = new Date().toLocaleDateString('en-CA');
  
  // Total metrics
  const completedAssignments = assignments.filter(a => a.status === 'Completed').length;
  const totalAssignments = assignments.length;
  const assignmentProgress = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);

  const completedStudyPlans = studyPlans.filter(sp => sp.study_date <= todayStr);
  const totalStudyMinutes = completedStudyPlans.reduce((acc, sp) => acc + sp.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Weekly activity (Last 7 days)
  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-CA');
  });

  const weeklyStudyHours = last7Days.map(dateStr => {
    const plansForDate = studyPlans.filter(sp => sp.study_date === dateStr);
    const mins = plansForDate.reduce((acc, sp) => acc + sp.duration, 0);
    return mins / 60;
  });

  const maxWeeklyHours = Math.max(...weeklyStudyHours, 1); // minimum 1 for scale

  return (
    <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
      <div className="mb-8">
        <h1 className="mb-2"><span className="text-gradient">Progress</span> Tracker 📈</h1>
        <p className="text-muted" style={{margin: 0}}>Analyze your study habits and assignment completion.</p>
      </div>

      {error ? (
        <div className="glass p-6 text-center text-muted">
          <p>{error}</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          
          {/* Top Level KPIs */}
          <div className="grid-cols-3" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="p-4 rounded-full mb-4" style={{background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)'}}>
                <Clock size={32} />
              </div>
              <h2 className="m-0" style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)'}}>{totalStudyHours}h</h2>
              <p className="text-muted m-0">Total Study Time</p>
            </div>
            
            <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="p-4 rounded-full mb-4" style={{background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)'}}>
                <CheckCircle size={32} />
              </div>
              <h2 className="m-0" style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)'}}>{completedAssignments}</h2>
              <p className="text-muted m-0">Assignments Completed</p>
            </div>

            <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="p-4 rounded-full mb-4" style={{background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-secondary)'}}>
                <Target size={32} />
              </div>
              <h2 className="m-0" style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)'}}>{assignmentProgress}%</h2>
              <p className="text-muted m-0">Completion Rate</p>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem'}}>
            {/* Weekly Activity Chart */}
            <div className="glass p-6 rounded-2xl flex flex-col">
              <h3 className="mb-6 flex items-center gap-2 m-0 text-gradient"><BarChart size={20}/> Weekly Study Activity</h3>
              <div className="flex items-end gap-2 mt-auto" style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px'}}>
                {last7Days.map((dateStr, i) => {
                  const hours = weeklyStudyHours[i];
                  const heightPercentage = (hours / maxWeeklyHours) * 100;
                  const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {weekday: 'short'});
                  
                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-2" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end'}}>
                      <div style={{
                        width: '100%', 
                        maxWidth: '40px', 
                        height: `${Math.max(heightPercentage, 2)}%`, // min height for visibility
                        background: hours > 0 ? 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        transition: 'height 0.5s ease'
                      }}></div>
                      <span className="text-xs text-muted" style={{fontSize: '0.75rem'}}>{displayDate}</span>
                      <span className="text-xs text-muted" style={{fontSize: '0.75rem', fontWeight: 'bold'}}>{hours > 0 ? hours.toFixed(1) + 'h' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="mb-6 flex items-center gap-2 m-0 text-gradient"><BookOpen size={20}/> Subject Breakdown</h3>
              {Object.keys(subjectStats).length === 0 ? (
                <p className="text-muted text-center mt-8">No subjects to display. Add assignments or study plans!</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                  {Object.entries(subjectStats)
                    .sort((a, b) => b[1].completedHours - a[1].completedHours) // sort by most studied
                    .map(([subject, stats]) => {
                    const assignProgress = stats.totalAssignments === 0 ? 0 : (stats.completedAssignments / stats.totalAssignments) * 100;
                    
                    return (
                      <div key={subject}>
                        <div className="flex justify-between items-center mb-2" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                          <span style={{fontWeight: 600, color: 'var(--text-main)'}}>{subject}</span>
                          <span className="text-xs text-muted" style={{fontSize: '0.85rem'}}>{stats.completedHours.toFixed(1)}h studied</span>
                        </div>
                        <div style={{width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem'}}>
                          <div style={{width: `${assignProgress}%`, background: 'var(--accent-success)', height: '100%', transition: 'width 0.5s ease'}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted" style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem'}}>
                          <span>Assignments: {stats.completedAssignments}/{stats.totalAssignments}</span>
                          <span>{Math.round(assignProgress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
