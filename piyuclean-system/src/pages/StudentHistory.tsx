import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAssignmentsExpanded, getClassrooms as apiGetClassrooms, type AssignmentExpanded, type Classroom } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { History, Filter, Download } from 'lucide-react';

const StudentHistory = () => {
  const { user } = useAuth();
  const [allAssignments, setAllAssignments] = useState<AssignmentExpanded[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, c] = await Promise.all([getAssignmentsExpanded(), apiGetClassrooms()]);
        setAllAssignments(a);
        setClassrooms(c);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get my assignments
  const myAssignments = useMemo(() => {
    return allAssignments.filter((a) => a.studentId === user?.id);
  }, [allAssignments, user]);

  // Apply filters
  const filteredAssignments = useMemo(() => {
    let filtered = [...myAssignments];

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((a) => new Date(a.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((a) => new Date(a.date) <= new Date(dateTo));
    }

    // Classroom filter
    if (selectedClassroom !== 'all') {
      filtered = filtered.filter((a) => a.classroomId === selectedClassroom);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [myAssignments, dateFrom, dateTo, selectedClassroom, selectedStatus]);

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedClassroom('all');
    setSelectedStatus('all');
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

  const exportToCSV = () => {
    const headers = ['Assignment Date', 'Task Name', 'Classroom', 'Status', 'Completion Date & Time'];
    const rows = filteredAssignments.map((a) => [
      format(new Date(a.date), 'yyyy-MM-dd'),
      a.taskName,
      a.classroomName,
      a.status,
      a.completedAt ? format(new Date(a.completedAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-cleaning-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <History className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Task Completion History</h1>
            <p className="text-emerald-50 text-lg">Review all your cleaning contributions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Your History
              </CardTitle>
              <CardDescription className="text-emerald-600">
                Narrow down your task history by date, classroom, or status
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Reset Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-gray-700 font-medium">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-gray-700 font-medium">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom" className="text-gray-700 font-medium">Classroom</Label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="All Classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 font-medium">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-800">
                Your Cleaning History ({filteredAssignments.length} record{filteredAssignments.length !== 1 ? 's' : ''})
              </CardTitle>
              <CardDescription className="text-emerald-600">
                Complete record of your assigned and completed tasks
              </CardDescription>
            </div>
            {filteredAssignments.length > 0 && (
              <Button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">No tasks found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead className="font-semibold text-emerald-900">Assignment Date</TableHead>
                    <TableHead className="font-semibold text-emerald-900">Task Name</TableHead>
                    <TableHead className="font-semibold text-emerald-900">Classroom</TableHead>
                    <TableHead className="font-semibold text-emerald-900">Status</TableHead>
                    <TableHead className="font-semibold text-emerald-900">Completion Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment, index) => (
                    <TableRow
                      key={assignment.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(assignment.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{assignment.taskName}</TableCell>
                      <TableCell>{assignment.classroomName}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        {assignment.completedAt ? (
                          <div>
                            <div className="font-medium text-green-700">
                              {format(new Date(assignment.completedAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(assignment.completedAt), 'h:mm a')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {filteredAssignments.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-green-100 shadow-md bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {filteredAssignments.filter((a) => a.status === 'completed').length}
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">
                Tasks finished successfully
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-md bg-gradient-to-br from-white to-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Still Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">
                {filteredAssignments.filter((a) => a.status === 'pending' || a.status === 'assigned').length}
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-md bg-gradient-to-br from-white to-teal-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-700">
                {filteredAssignments.length > 0
                  ? Math.round(
                      (filteredAssignments.filter((a) => a.status === 'completed').length /
                        filteredAssignments.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-teal-600 font-medium mt-1">
                Of filtered tasks
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentHistory;

