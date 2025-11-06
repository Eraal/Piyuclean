import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAdminUsers, getStudents, getClassrooms, getTasks, getChecklists, getAssignmentsRaw } from '@/lib/api';

interface SystemSettings {
  schoolName: string;
  departmentName: string;
  timezone: string;
  notificationsEnabled: boolean;
  backupPath: string;
}

const TIMEZONES = [
  'Asia/Manila',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
];

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    schoolName: '',
    departmentName: '',
    timezone: 'Asia/Manila',
    notificationsEnabled: true,
    backupPath: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = sessionStorage.getItem('ccms_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    sessionStorage.setItem('ccms_settings', JSON.stringify(settings));
    toast({
      title: 'Success',
      description: 'Settings saved successfully',
    });
  };

  const handleBackup = async () => {
    try {
      const [adminUsers, students, classrooms, tasks, checklists, assignments] = await Promise.all([
        getAdminUsers(),
        getStudents(),
        getClassrooms(),
        getTasks(),
        getChecklists(),
        getAssignmentsRaw(),
      ]);

      const data = {
        adminUsers,
        students,
        classrooms,
        tasks,
        checklists,
        assignments,
        settings: settings,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ccms-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'Database backup downloaded' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to export backup' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div>
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                value={settings.departmentName}
                onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Default Time Zone</Label>
            <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="backupPath">Backup Path (Optional)</Label>
            <Input
              id="backupPath"
              value={settings.backupPath}
              onChange={(e) => setSettings({ ...settings, backupPath: e.target.value })}
              placeholder="C:\Backups or leave empty for downloads"
            />
          </div>

          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Backup your database regularly to prevent data loss. The backup will download as a JSON file.
            </p>
            <Button onClick={handleBackup}>Download Database Backup</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
