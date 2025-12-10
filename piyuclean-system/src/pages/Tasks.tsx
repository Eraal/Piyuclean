import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  getTasks as apiGetTasks,
  createTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  getChecklists as apiGetChecklists,
  createChecklist,
  updateChecklist as apiUpdateChecklist,
  deleteChecklist as apiDeleteChecklist,
  type CleaningTask,
  type Checklist,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Tasks = () => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CleaningTask | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [taskFormData, setTaskFormData] = useState<Partial<CleaningTask>>({
    name: '',
    description: '',
  });
  const [checklistFormData, setChecklistFormData] = useState<Partial<Checklist>>({
    name: '',
    description: '',
    taskIds: [],
  });
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const friendlyMessage = (raw: string | null) => {
    if (!raw) return 'This item cannot be deleted right now.';
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.message) return String(parsed.message);
    } catch (_) {
      // not JSON
    }
    return raw.replace(/^[{\"]+|[\"}]+$/g, '');
  };

  useEffect(() => {
    (async () => {
      try {
        const [t, c] = await Promise.all([apiGetTasks(), apiGetChecklists()]);
        setTasks(t);
        setChecklists(c);
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to load tasks/checklists' });
      }
    })();
  }, [toast]);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormData({ name: '', description: '' });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: CleaningTask) => {
    setEditingTask(task);
    setTaskFormData(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskFormData.name) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Task name is required.',
      });
      return;
    }

    try {
      if (editingTask) {
        await apiUpdateTask(editingTask.id, {
          name: taskFormData.name!,
          description: taskFormData.description || '',
        });
      } else {
        await createTask({
          name: taskFormData.name!,
          description: taskFormData.description || '',
        });
      }
      const t = await apiGetTasks();
      setTasks(t);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save task' });
      return;
    }
    setTaskDialogOpen(false);
    toast({
      title: 'Success',
      description: `Task ${editingTask ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiDeleteTask(id);
        const t = await apiGetTasks();
        setTasks(t);
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : 'Failed to delete task';
        setErrorDialog(msg);
        return;
      }
      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
      });
    }
  };

  const handleAddChecklist = () => {
    setEditingChecklist(null);
    setChecklistFormData({ name: '', description: '', taskIds: [] });
    setChecklistDialogOpen(true);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setChecklistFormData(checklist);
    setChecklistDialogOpen(true);
  };

  const handleSaveChecklist = async () => {
    if (!checklistFormData.name || !checklistFormData.taskIds || checklistFormData.taskIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Checklist name and at least one task are required.',
      });
      return;
    }

    try {
      if (editingChecklist) {
        await apiUpdateChecklist(editingChecklist.id, {
          name: checklistFormData.name!,
          description: checklistFormData.description || '',
          taskIds: checklistFormData.taskIds!,
        });
      } else {
        await createChecklist({
          name: checklistFormData.name!,
          description: checklistFormData.description || '',
          taskIds: checklistFormData.taskIds!,
        });
      }
      const c = await apiGetChecklists();
      setChecklists(c);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save checklist' });
      return;
    }
    setChecklistDialogOpen(false);
    toast({
      title: 'Success',
      description: `Checklist ${editingChecklist ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleDeleteChecklist = async (id: string) => {
    if (confirm('Are you sure you want to delete this checklist?')) {
      try {
        await apiDeleteChecklist(id);
        const c = await apiGetChecklists();
        setChecklists(c);
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : 'Failed to delete checklist';
        setErrorDialog(msg);
        return;
      }
      toast({
        title: 'Success',
        description: 'Checklist deleted successfully.',
      });
    }
  };

  const toggleTaskInChecklist = (taskId: string) => {
    const currentIds = checklistFormData.taskIds || [];
    const newIds = currentIds.includes(taskId)
      ? currentIds.filter((id) => id !== taskId)
      : [...currentIds, taskId];
    setChecklistFormData({ ...checklistFormData, taskIds: newIds });
  };

  const getTasksByIds = (taskIds: string[]) => {
    return tasks.filter((t) => taskIds.includes(t.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks & Checklists</h1>
        <p className="text-muted-foreground">Configure cleaning tasks and create reusable checklists</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Standard Tasks</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Standard Cleaning Tasks</CardTitle>
                <CardDescription>Define individual cleaning actions ({tasks.length} tasks)</CardDescription>
              </div>
              <Button onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No tasks defined. Click "Add Task" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell className="max-w-md truncate">{task.description}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
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
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Manage Checklists</CardTitle>
                <CardDescription>Create reusable sets of tasks ({checklists.length} checklists)</CardDescription>
              </div>
              <Button onClick={handleAddChecklist}>
                <Plus className="mr-2 h-4 w-4" />
                Create Checklist
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Checklist Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checklists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No checklists created. Click "Create Checklist" to start.
                        </TableCell>
                      </TableRow>
                    ) : (
                      checklists.map((checklist) => (
                        <TableRow key={checklist.id}>
                          <TableCell className="font-medium">{checklist.name}</TableCell>
                          <TableCell className="max-w-sm truncate">{checklist.description}</TableCell>
                          <TableCell>{checklist.taskIds.length} tasks</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditChecklist(checklist)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteChecklist(checklist.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>Define a standard cleaning task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={taskFormData.name}
                onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                placeholder="e.g., Sweep floor, Clean whiteboard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Detailed instructions for this task"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Dialog */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}</DialogTitle>
            <DialogDescription>Create a reusable set of cleaning tasks.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checklistName">Checklist Name</Label>
              <Input
                id="checklistName"
                value={checklistFormData.name}
                onChange={(e) => setChecklistFormData({ ...checklistFormData, name: e.target.value })}
                placeholder="e.g., Daily Classroom Clean, Weekly Deep Clean"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checklistDescription">Description</Label>
              <Textarea
                id="checklistDescription"
                value={checklistFormData.description}
                onChange={(e) => setChecklistFormData({ ...checklistFormData, description: e.target.value })}
                placeholder="Purpose or context for this checklist"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Tasks</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks available. Create tasks first.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={checklistFormData.taskIds?.includes(task.id)}
                        onCheckedChange={() => toggleTaskInChecklist(task.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {task.name}
                        </label>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {checklistFormData.taskIds?.length || 0} task(s) selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChecklistDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChecklist}>Save Checklist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!errorDialog} onOpenChange={(open) => !open && setErrorDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Action blocked</AlertDialogTitle>
            <AlertDialogDescription className={cn('text-sm text-muted-foreground')}>
              {friendlyMessage(errorDialog)}
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

export default Tasks;
