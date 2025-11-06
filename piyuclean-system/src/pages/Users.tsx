import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getAdminUsers as apiGetAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser as apiDeleteAdminUser, type AdminUser } from '@/lib/api';
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'Teacher' as AdminUser['role'],
  });
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      const list = await apiGetAdminUsers();
      setUsers(list);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to load users' });
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddNew = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'Teacher',
    });
    setIsAddEditOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      fullName: user.fullName,
      role: user.role,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.fullName) {
      toast({
        title: 'Error',
        description: 'Username and Full Name are required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedUser && !formData.password) {
      toast({
        title: 'Error',
        description: 'Password is required for new users',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedUser) {
        await updateAdminUser(selectedUser.id, {
          username: formData.username,
          fullName: formData.fullName,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        });
      } else {
        await createAdminUser({
          id: undefined,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          status: 'active',
        });
      }
      await loadUsers();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save user' });
      return;
    }
    setIsAddEditOpen(false);
    toast({
      title: 'Success',
      description: `User ${selectedUser ? 'updated' : 'added'} successfully`,
    });
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await apiDeleteAdminUser(selectedUser.id);
      await loadUsers();
      setIsDeleteOpen(false);
      toast({ title: 'Success', description: 'User deleted successfully' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to delete user' });
    }
  };

  const handleResetPassword = async () => {
    if (!formData.password || formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedUser) return;
    try {
      await updateAdminUser(selectedUser.id, { password: formData.password });
      await loadUsers();
      setIsResetPasswordOpen(false);
      toast({ title: 'Success', description: 'Password reset successfully' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to reset password' });
    }
  };

  const openResetPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: '', confirmPassword: '' });
    setIsResetPasswordOpen(true);
  };

  const openDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span className={user.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openResetPassword(user)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as AdminUser['role'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Class Adviser">Class Adviser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!selectedUser && (
              <>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{selectedUser?.username}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
