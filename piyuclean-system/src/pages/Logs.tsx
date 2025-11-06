import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAssignmentsExpanded, getStudents as apiGetStudents, getClassrooms as apiGetClassrooms, updateAssignmentRaw, type AssignmentExpanded, type Student, type Classroom } from '@/lib/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Logs = () => {
  const [assignments, setAssignments] = useState<AssignmentExpanded[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const { toast } = useToast();

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
        toast({ variant: 'destructive', title: 'Failed to load logs data' });
      }
    })();
  }, [toast]);

  const markCompleted = async (id: string) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;
    try {
      const taskAssignmentId = assignment.id.split('-')[0];
      await updateAssignmentRaw(taskAssignmentId, { status: 'completed', completedAt: new Date().toISOString() });
      const a = await getAssignmentsExpanded();
      setAssignments(a);
      toast({ title: 'Success', description: 'Task marked as completed.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to update assignment' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Completion Logs</h1>
        <p className="text-muted-foreground">Monitor and verify task completion</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Records</CardTitle>
          <CardDescription>{assignments.length} total assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => {
                const student = students.find((s) => s.id === a.studentId);
                const classroom = classrooms.find((c) => c.id === a.classroomId);
                return (
                  <TableRow key={a.id}>
                    <TableCell>{format(new Date(a.date), 'PP')}</TableCell>
                    <TableCell>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</TableCell>
                    <TableCell>{classroom?.name || 'Unknown'}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>{a.completedAt ? format(new Date(a.completedAt), 'PPp') : '-'}</TableCell>
                    <TableCell>
                      {a.status !== 'completed' && (
                        <Button size="sm" onClick={() => markCompleted(a.id)}>Mark Complete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
