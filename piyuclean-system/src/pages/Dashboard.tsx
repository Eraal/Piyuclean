import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAssignmentsExpanded, getStudents as apiGetStudents, getClassrooms as apiGetClassrooms, type AssignmentExpanded, type Student, type Classroom } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const Dashboard = () => {
  const [assignments, setAssignments] = useState<AssignmentExpanded[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, s, c] = await Promise.all([
          getAssignmentsExpanded(),
          apiGetStudents(),
          apiGetClassrooms(),
        ]);
        setAssignments(a);
        setStudents(s);
        setClassrooms(c);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekEnd = useMemo(() => endOfWeek(today), [today]);

  const stats = useMemo(() => {
    const weekAssignments = assignments.filter((a) => {
      const assignmentDate = new Date(a.date);
      return isWithinInterval(assignmentDate, { start: weekStart, end: weekEnd });
    });

    const todayAssignments = assignments.filter(
      (a) => format(new Date(a.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );

    return {
      totalAssignments: weekAssignments.length,
      completedTasks: weekAssignments.filter((a) => a.status === 'completed').length,
      pendingTasks: weekAssignments.filter((a) => a.status === 'pending' || a.status === 'assigned').length,
      overdueTasks: weekAssignments.filter((a) => a.status === 'overdue').length,
      todayTotal: todayAssignments.length,
      todayCompleted: todayAssignments.filter((a) => a.status === 'completed').length,
      completionRate: weekAssignments.length > 0 
        ? Math.round((weekAssignments.filter((a) => a.status === 'completed').length / weekAssignments.length) * 100)
        : 0,
    };
  }, [assignments, today, weekStart, weekEnd]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-emerald-50 text-lg">Welcome to your classroom cleaning management overview</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] bg-gradient-to-br from-white to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Assignments (Week)</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats.totalAssignments}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {stats.todayTotal} assigned today
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed Tasks</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.completedTasks}</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              {stats.todayCompleted} completed today
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Tasks</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{stats.pendingTasks}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] bg-gradient-to-br from-white to-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completion Rate</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{stats.completionRate}%</div>
            <p className="text-xs text-teal-600 font-medium mt-1">
              {stats.overdueTasks} overdue tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800">Quick Overview</CardTitle>
            <CardDescription className="text-emerald-600">System statistics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Students:</span>
              <span className="font-bold text-emerald-700 text-lg">{students.filter((s) => s.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Classrooms:</span>
              <span className="font-bold text-teal-700 text-lg">{classrooms.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Week Period:</span>
              <span className="font-semibold text-cyan-700 text-sm">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800">Quick Actions</CardTitle>
            <CardDescription className="text-emerald-600">Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <a href="/assignments" className="flex items-center gap-2 p-3 bg-white border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
              <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              Assign new cleaning tasks
            </a>
            <a href="/logs" className="flex items-center gap-2 p-3 bg-white border border-teal-200 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all group">
              <span className="text-teal-600 group-hover:translate-x-1 transition-transform">→</span>
              View completion logs
            </a>
            <a href="/reports" className="flex items-center gap-2 p-3 bg-white border border-cyan-200 rounded-lg text-sm font-medium text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all group">
              <span className="text-cyan-600 group-hover:translate-x-1 transition-transform">→</span>
              Generate weekly report
            </a>
            <a href="/students" className="flex items-center gap-2 p-3 bg-white border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
              <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
              Manage students
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
