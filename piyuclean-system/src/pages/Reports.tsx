import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import {
  getWeeklySummary,
  getStudentPerformance,
  type WeeklySummaryResponse,
  type StudentPerformanceResponse,
} from '@/lib/api';
import { format } from 'date-fns';

const Reports = () => {
  const [weekly, setWeekly] = useState<WeeklySummaryResponse | null>(null);
  const [perf, setPerf] = useState<StudentPerformanceResponse | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingPerf, setLoadingPerf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeekly = async () => {
    try {
      setError(null);
      setLoadingWeekly(true);
      const data = await getWeeklySummary();
      setWeekly(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load weekly summary');
    } finally {
      setLoadingWeekly(false);
    }
  };

  const fetchPerf = async () => {
    try {
      setError(null);
      setLoadingPerf(true);
      const data = await getStudentPerformance();
      setPerf(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load student performance');
    } finally {
      setLoadingPerf(false);
    }
  };

  useEffect(() => {
    // auto-load on page open
    fetchWeekly();
    fetchPerf();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Summary</CardTitle>
          <Button variant="outline" onClick={fetchWeekly} disabled={loadingWeekly}>
            <FileText className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {!weekly ? (
            <div className="text-sm text-gray-500">{loadingWeekly ? 'Loading…' : 'No data yet'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Assigned</th>
                    <th className="px-3 py-2 text-right">Pending</th>
                    <th className="px-3 py-2 text-right">Completed</th>
                    <th className="px-3 py-2 text-right">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.days.map((d) => (
                    <tr key={d.date} className="border-t">
                      <td className="px-3 py-2">{format(new Date(d.date), 'EEE, MMM d')}</td>
                      <td className="px-3 py-2 text-right">{d.assigned}</td>
                      <td className="px-3 py-2 text-right">{d.pending}</td>
                      <td className="px-3 py-2 text-right">{d.completed}</td>
                      <td className="px-3 py-2 text-right">{d.overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Performance (last 28 days)</CardTitle>
          <Button variant="outline" onClick={fetchPerf} disabled={loadingPerf}>
            <FileText className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {!perf ? (
            <div className="text-sm text-gray-500">{loadingPerf ? 'Loading…' : 'No data yet'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-left">Section</th>
                    <th className="px-3 py-2 text-right">Assigned</th>
                    <th className="px-3 py-2 text-right">Completed</th>
                    <th className="px-3 py-2 text-right">Overdue</th>
                    <th className="px-3 py-2 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {perf.students.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.name} ({s.studentId})</td>
                      <td className="px-3 py-2">{s.classSection}</td>
                      <td className="px-3 py-2 text-right">{s.assigned}</td>
                      <td className="px-3 py-2 text-right">{s.completed}</td>
                      <td className="px-3 py-2 text-right">{s.overdue}</td>
                      <td className="px-3 py-2 text-right">{(s.completionRate * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
