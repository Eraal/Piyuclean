from flask import Blueprint, request, jsonify
from datetime import date, timedelta
from ..models.models import TaskAssignment, TaskAssignmentStudent, Student

bp = Blueprint("reports", __name__)


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def _current_week_range(today: date | None = None) -> tuple[date, date]:
    d = today or date.today()
    start = d - timedelta(days=d.weekday())  # Monday
    end = start + timedelta(days=6)  # Sunday
    return start, end


@bp.get("/weekly-summary")
def weekly_summary():
    start = _parse_date(request.args.get("start"))
    end = _parse_date(request.args.get("end"))
    if not start or not end:
        start, end = _current_week_range()

    # Initialize all days in range
    days: dict[str, dict[str, int]] = {}
    cur = start
    while cur <= end:
        days[cur.isoformat()] = {"assigned": 0, "pending": 0, "completed": 0, "overdue": 0}
        cur += timedelta(days=1)

    items = TaskAssignment.query.filter(TaskAssignment.date >= start, TaskAssignment.date <= end).all()
    for ta in items:
        key = ta.date.isoformat()
        if key not in days:
            days[key] = {"assigned": 0, "pending": 0, "completed": 0, "overdue": 0}
        # Count by status; default others as pending if unexpected
        status = (ta.status or "").lower()
        if status in days[key]:
            days[key][status] += 1
        else:
            days[key]["pending"] += 1

    return jsonify({
        "start": start.isoformat(),
        "end": end.isoformat(),
        "days": [{"date": k, **v} for k, v in sorted(days.items(), key=lambda x: x[0])],
    })


@bp.get("/student-performance")
def student_performance():
    start = _parse_date(request.args.get("start"))
    end = _parse_date(request.args.get("end"))
    # If no range is provided, include all data (do not filter by date)
    # This prevents empty results when data exists outside the last 28 days.
    apply_date_filter = bool(start and end)
    if not apply_date_filter:
        start = None
        end = None

    # Join TaskAssignmentStudent -> TaskAssignment -> Student
    q = (
        TaskAssignmentStudent.query
        .join(TaskAssignment, TaskAssignmentStudent.assignment_id == TaskAssignment.id)
        .join(Student, TaskAssignmentStudent.student_id == Student.id)
    )
    if apply_date_filter:
        q = q.filter(TaskAssignment.date >= start, TaskAssignment.date <= end)

    # Aggregate in Python for simplicity
    perf: dict[int, dict] = {}
    for tas in q.all():
        s = tas.student
        ta = tas.assignment
        if s.id not in perf:
            perf[s.id] = {
                "id": s.ext_id or str(s.id),
                "studentId": s.student_id,
                "name": f"{s.first_name} {s.last_name}",
                "classSection": s.class_section,
                "assigned": 0,
                "completed": 0,
                "overdue": 0,
            }
        perf[s.id]["assigned"] += 1
        status = (ta.status or "").lower()
        if status == "completed":
            perf[s.id]["completed"] += 1
        elif status == "overdue":
            perf[s.id]["overdue"] += 1

    # Compute completion rate and sort
    students = []
    for s in perf.values():
        assigned = s["assigned"] or 0
        completed = s["completed"] or 0
        s["completionRate"] = (completed / assigned) if assigned else 0.0
        students.append(s)

    students.sort(key=lambda x: (x["completionRate"], x["completed"]), reverse=True)

    start_out = start.isoformat() if start else None
    end_out = end.isoformat() if end else None

    return jsonify({
        "start": start_out,
        "end": end_out,
        "students": students,
    })
