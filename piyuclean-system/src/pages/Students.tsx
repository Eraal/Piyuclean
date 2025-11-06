import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStudents as apiGetStudents, createStudent, updateStudent as apiUpdateStudent, deleteStudent as apiDeleteStudent, type Student } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    studentId: '',
    classSection: '',
    status: 'active',
  });
  const { toast } = useToast();

  // load students on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetStudents();
        setStudents(data);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to load students' });
      }
    })();
  }, [toast]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.classSection.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({ firstName: '', lastName: '', studentId: '', classSection: '', status: 'active' });
    setDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.studentId || !formData.classSection) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      if (editingStudent) {
        await apiUpdateStudent(editingStudent.id, {
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          studentId: formData.studentId!,
          classSection: formData.classSection!,
          status: formData.status || 'active',
        });
      } else {
        await createStudent({
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          studentId: formData.studentId!,
          classSection: formData.classSection!,
          status: formData.status || 'active',
        });
      }
      const data = await apiGetStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save student' });
      return;
    }
    setDialogOpen(false);
    toast({
      title: 'Success',
      description: `Student ${editingStudent ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await apiDeleteStudent(id);
        const data = await apiGetStudents();
        setStudents(data);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to delete student' });
        return;
      }
      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage students participating in the cleaning program</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Total: {students.length} students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Class/Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No students found. Click "Add Student" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.classSection}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            student.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              Enter the student details below. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g., 2024001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classSection">Class/Section</Label>
              <Select
                value={formData.classSection}
                onValueChange={(value) => setFormData({ ...formData, classSection: value })}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Select a class/section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSIT 1A">BSIT 1A</SelectItem>
                  <SelectItem value="BSIT 1B">BSIT 1B</SelectItem>
                  <SelectItem value="BSIT 1C">BSIT 1C</SelectItem>
                  <SelectItem value="BSIT 1D">BSIT 1D</SelectItem>
                  <SelectItem value="BSIT 2A">BSIT 2A</SelectItem>
                  <SelectItem value="BSIT 2B">BSIT 2B</SelectItem>
                  <SelectItem value="BSIT 2C">BSIT 2C</SelectItem>
                  <SelectItem value="BSIT 2D">BSIT 2D</SelectItem>
                  <SelectItem value="BSIT 3A AMG">BSIT 3A AMG</SelectItem>
                  <SelectItem value="BSIT 3B AMG">BSIT 3B AMG</SelectItem>
                  <SelectItem value="BSIT 3C WMAD">BSIT 3C WMAD</SelectItem>
                  <SelectItem value="BSIT 3D NETAD">BSIT 3D NETAD</SelectItem>
                  <SelectItem value="BSIT 4A AMG">BSIT 4A AMG</SelectItem>
                  <SelectItem value="BSIT 4B AMG">BSIT 4B AMG</SelectItem>
                  <SelectItem value="BSIT 4C WMAD">BSIT 4C WMAD</SelectItem>
                  <SelectItem value="BSIT 4D NETAD">BSIT 4D NETAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
