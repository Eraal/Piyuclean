import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getStudents as apiGetStudents,
  getClassrooms as apiGetClassrooms,
  getChecklists as apiGetChecklists,
  getAssignmentsRaw as apiGetAssignments,
  createAssignment as apiCreateAssignment,
  type TaskAssignment,
  type Student,
  type Classroom,
  type Checklist,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shuffle, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Assignments = () => {
  const [assignmentType, setAssignmentType] = useState<'random' | 'specific'>('random');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState('');
  const [numStudents, setNumStudents] = useState('1');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [s, c, l, a] = await Promise.all([
          apiGetStudents(),
          apiGetClassrooms(),
          apiGetChecklists(),
          apiGetAssignments(),
        ]);
        setStudents(s.filter((x) => x.status === 'active'));
        setClassrooms(c);
        setChecklists(l);
        setAssignments(a);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to load data' });
      }
    })();
  }, [toast]);

  const classroomStudents = useMemo(() => {
    if (!selectedClassroom) return students; // Show all students if no classroom selected
    const classroom = classrooms.find((c) => c.id === selectedClassroom);
    if (!classroom) return students; // Show all students if classroom not found
    // For now, return all students since classroom names don't match student class sections
    // In a real system, you'd have a proper mapping between classrooms and student sections
    return students;
  }, [selectedClassroom, students, classrooms]);

  // Get all students for the dropdown (not filtered by classroom)
  const allStudents = useMemo(() => {
    return students;
  }, [students]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (selectedDate && format(new Date(a.date), 'yyyy-MM-dd') !== selectedDate) return false;
      if (selectedClassroom && a.classroomId !== selectedClassroom) return false;
      return true;
    });
  }, [assignments, selectedDate, selectedClassroom]);

  const handleGenerateAssignment = () => {
    if (!selectedClassroom || !selectedChecklist) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a classroom and checklist.',
      });
      return;
    }

    let assignedStudentIds: string[] = [];

    if (assignmentType === 'random') {
      const count = parseInt(numStudents, 10);
      if (count <= 0 || count > classroomStudents.length) {
        toast({
          variant: 'destructive',
          title: 'Invalid Number',
          description: `Please enter a number between 1 and ${classroomStudents.length}.`,
        });
        return;
      }
      
      // Random selection
      const shuffled = [...classroomStudents].sort(() => 0.5 - Math.random());
      assignedStudentIds = shuffled.slice(0, count).map((s) => s.id);
    } else {
      if (selectedStudents.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Students Selected',
          description: 'Please select at least one student.',
        });
        return;
      }
      assignedStudentIds = selectedStudents;
    }

    const payload: Omit<TaskAssignment, 'id'> = {
      date: selectedDate,
      classroomId: selectedClassroom,
      studentIds: assignedStudentIds,
      checklistId: selectedChecklist,
      status: 'assigned',
    };

    (async () => {
      try {
        await apiCreateAssignment(payload);
        const a = await apiGetAssignments();
        setAssignments(a);
        toast({
          title: 'Success',
          description: `Task assigned to ${assignedStudentIds.length} student(s).`,
        });
        setSelectedStudents([]);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to create assignment' });
      }
    })();
  };

  const getStudentNames = (studentIds: string[] | undefined) => {
    if (!studentIds || !Array.isArray(studentIds)) {
      return 'No students assigned';
    }
    return studentIds
      .map((id) => {
        const student = students.find((s) => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
      })
      .join(', ');
  };

  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find((c) => c.id === classroomId);
    return classroom?.name || 'Unknown';
  };

  const getChecklistName = (checklistId: string) => {
    const checklist = checklists.find((c) => c.id === checklistId);
    return checklist?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Assignment</h1>
        <p className="text-muted-foreground">Assign cleaning duties to students</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Assignment</CardTitle>
            <CardDescription>Configure and generate task assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentDate">Assignment Date</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classroom">Select Classroom</Label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClassroom && (
                <p className="text-xs text-muted-foreground">
                  {classroomStudents.length} active student(s) available for assignment
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checklist">Select Checklist</Label>
              <Select value={selectedChecklist} onValueChange={setSelectedChecklist}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a checklist" />
                </SelectTrigger>
                <SelectContent>
                  {checklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      {checklist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Assignment Method</Label>
              <RadioGroup value={assignmentType} onValueChange={(v) => setAssignmentType(v as 'random' | 'specific')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="font-normal cursor-pointer">
                    Random Assignment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="font-normal cursor-pointer">
                    Specific Students
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {assignmentType === 'random' ? (
              <div className="space-y-2">
                <Label htmlFor="numStudents">Number of Students</Label>
                <Input
                  id="numStudents"
                  type="number"
                  min="1"
                  max={classroomStudents.length}
                  value={numStudents}
                  onChange={(e) => setNumStudents(e.target.value)}
                  disabled={!selectedClassroom}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Students</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!selectedStudents.includes(value)) {
                      setSelectedStudents([...selectedStudents, value]);
                    }
                  }}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                    <SelectValue placeholder="Add students..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.classSection})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStudents.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {selectedStudents.map((id) => {
                      const student = students.find((s) => s.id === id);
                      return (
                        <div key={id} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span>{student?.firstName} {student?.lastName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudents(selectedStudents.filter((sid) => sid !== id))}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleGenerateAssignment} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {assignmentType === 'random' ? 'Generate Random Assignment' : 'Assign to Selected Students'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              {filteredAssignments.length} assignment(s) for selected date/classroom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assignments found. Create one to get started.
                </p>
              ) : (
                filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{getClassroomName(assignment.classroomId)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(assignment.date), 'PPP')}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          assignment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : assignment.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm">
                      <strong>Checklist:</strong> {getChecklistName(assignment.checklistId)}
                    </p>
                    <p className="text-sm">
                      <strong>Students:</strong> {getStudentNames(assignment.studentIds)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>Complete list of task assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Checklist</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No assignments created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{format(new Date(assignment.date), 'PP')}</TableCell>
                      <TableCell>{getClassroomName(assignment.classroomId)}</TableCell>
                      <TableCell className="max-w-xs truncate">{getStudentNames(assignment.studentIds)}</TableCell>
                      <TableCell>{getChecklistName(assignment.checklistId)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            assignment.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : assignment.status === 'overdue'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;
