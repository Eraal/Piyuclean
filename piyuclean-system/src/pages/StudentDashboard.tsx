import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAssignmentsExpanded, updateAssignmentRaw, type AssignmentExpanded } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { format, isToday, isThisWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssignmentExpanded[]>([]);
  const [taskToComplete, setTaskToComplete] = useState<AssignmentExpanded | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAssignmentsExpanded();
        setAssignments(data);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to load assignments' });
      }
    })();
  }, [toast]);

  // Filter assignments for the current student
  const myAssignments = useMemo(() => {
    return assignments.filter((a) => a.studentId === user?.id);
  }, [assignments, user]);

  // Today's tasks
  const todayTasks = useMemo(() => {
    return myAssignments.filter((a) => isToday(new Date(a.date)));
  }, [myAssignments]);

  // This week's tasks
  const weekTasks = useMemo(() => {
    return myAssignments.filter((a) => isThisWeek(new Date(a.date)));
  }, [myAssignments]);

  // Pending tasks
  const pendingTasks = useMemo(() => {
    return weekTasks.filter((a) => a.status === 'pending' || a.status === 'assigned');
  }, [weekTasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return weekTasks.filter((a) => a.status === 'overdue');
  }, [weekTasks]);

  // Recently completed tasks (last 3)
  const recentCompletions = useMemo(() => {
    return myAssignments
      .filter((a) => a.status === 'completed' && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3);
  }, [myAssignments]);

  const handleMarkComplete = (assignment: AssignmentExpanded) => {
    setTaskToComplete(assignment);
  };

  const confirmComplete = async () => {
    if (!taskToComplete) return;

    try {
      // Use the stable assignmentId field provided by the backend
      const taskAssignmentId = taskToComplete.assignmentId;
      await updateAssignmentRaw(taskAssignmentId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      const data = await getAssignmentsExpanded();
      setAssignments(data);
      toast({
        title: 'Task Completed!',
        description: `You've successfully completed "${taskToComplete.taskName}".`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to update assignment' });
    } finally {
      setTaskToComplete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
      case 'pending':
      case 'assigned':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Kumusta, {user && 'studentId' in user ? `${user.firstName} ${user.lastName}` : 'Student'}</h1>
          <p className="text-emerald-50 text-lg">Here are your cleaning tasks for today and this week</p>
        </div>
      </div>

      {/* Alert for pending/overdue tasks */}
      {(pendingTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                You have {pendingTasks.length + overdueTasks.length} pending task{(pendingTasks.length + overdueTasks.length) !== 1 ? 's' : ''}!
              </p>
              {overdueTasks.length > 0 && (
                <p className="text-sm text-amber-700">
                  {overdueTasks.length} task{overdueTasks.length !== 1 ? 's are' : ' is'} overdue
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Today's Tasks</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{todayTasks.length}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {todayTasks.filter(t => t.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">This Week</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{weekTasks.length}</div>
            <p className="text-xs text-teal-600 font-medium mt-1">
              {weekTasks.filter(t => t.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{pendingTasks.length}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Need completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <CardTitle className="text-emerald-800 text-2xl">Your Tasks for {format(new Date(), 'EEEE, MMMM d, yyyy')}</CardTitle>
          <CardDescription className="text-emerald-600">Click "Mark as Complete" when you finish a task</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">No tasks assigned for today</p>
              <p className="text-sm text-gray-500 mt-1">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-emerald-100 rounded-xl p-5 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{assignment.taskName}</h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-emerald-700">Classroom:</span>
                          {assignment.classroomName}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-emerald-700">Due:</span>
                          {format(new Date(assignment.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        {assignment.completedAt && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-green-700">Completed:</span>
                            {format(new Date(assignment.completedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                    {(assignment.status === 'pending' || assignment.status === 'assigned' || assignment.status === 'overdue') && (
                      <Button
                        onClick={() => handleMarkComplete(assignment)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completions */}
      {recentCompletions.length > 0 && (
        <Card className="border-green-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-green-800">Recently Completed Tasks</CardTitle>
            <CardDescription className="text-green-600">Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentCompletions.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{assignment.taskName}</p>
                      <p className="text-sm text-gray-600">Classroom: {assignment.classroomName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">
                      {format(new Date(assignment.completedAt!), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(assignment.completedAt!), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!taskToComplete} onOpenChange={() => setTaskToComplete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Task as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{taskToComplete?.taskName}" in {taskToComplete?.classroomName} as complete?
              <br /><br />
              This will record the current date and time as the completion timestamp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmComplete}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
            >
              Yes, Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDashboard;

