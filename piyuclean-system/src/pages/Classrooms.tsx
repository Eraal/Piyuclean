import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { getClassrooms as apiGetClassrooms, createClassroom, updateClassroom as apiUpdateClassroom, deleteClassroom as apiDeleteClassroom, type Classroom } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState<Partial<Classroom>>({
    classroomId: '',
    name: '',
    description: '',
  });
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetClassrooms();
        setClassrooms(data);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to load classrooms' });
      }
    })();
  }, [toast]);

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.classroomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classrooms, searchTerm]);

  const handleAdd = () => {
    setEditingClassroom(null);
    setFormData({ classroomId: '', name: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setFormData(classroom);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.classroomId || !formData.name) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      if (editingClassroom) {
        await apiUpdateClassroom(editingClassroom.id, {
          classroomId: formData.classroomId!,
          name: formData.name!,
          description: formData.description || '',
        });
      } else {
        await createClassroom({
          classroomId: formData.classroomId!,
          name: formData.name!,
          description: formData.description || '',
        });
      }
      const data = await apiGetClassrooms();
      setClassrooms(data);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save classroom' });
      return;
    }
    setDialogOpen(false);
    toast({
      title: 'Success',
      description: `Classroom ${editingClassroom ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this classroom?')) {
      try {
        await apiDeleteClassroom(id);
        const data = await apiGetClassrooms();
        setClassrooms(data);
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : 'Failed to delete classroom';
        // Show a modal for better UX when deletion is blocked (e.g., referenced by assignments)
        setErrorDialog(msg);
        return;
      }
      toast({
        title: 'Success',
        description: 'Classroom deleted successfully.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classroom Management</h1>
          <p className="text-muted-foreground">Manage physical classrooms and learning spaces</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Classroom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classrooms</CardTitle>
          <CardDescription>Total: {classrooms.length} classrooms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
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
                  <TableHead>Classroom ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClassrooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No classrooms found. Click "Add Classroom" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.classroomId}</TableCell>
                      <TableCell>{classroom.name}</TableCell>
                      <TableCell className="max-w-md truncate">{classroom.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(classroom)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(classroom.id)}>
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
            <DialogTitle>{editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
            <DialogDescription>
              Enter the classroom details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classroomId">Classroom ID</Label>
              <Input
                id="classroomId"
                value={formData.classroomId}
                onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                placeholder="e.g., C201, LAB-A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Classroom Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Computer Lab, Lecture Hall A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the classroom"
                rows={3}
              />
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

      <AlertDialog open={!!errorDialog} onOpenChange={(open) => !open && setErrorDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unable to delete classroom</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialog || 'This classroom cannot be deleted right now.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classrooms;
