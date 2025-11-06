from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .db import db
from .config import Config

migrate = Migrate()


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    # Blueprints
    from .routes.auth import bp as auth_bp
    from .routes.students import bp as students_bp
    from .routes.classrooms import bp as classrooms_bp
    from .routes.tasks import bp as tasks_bp
    from .routes.checklists import bp as checklists_bp
    from .routes.assignments import bp as assignments_bp
    from .routes.admin_users import bp as admin_users_bp
    from .routes.reports import bp as reports_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(classrooms_bp, url_prefix="/api/classrooms")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(checklists_bp, url_prefix="/api/checklists")
    app.register_blueprint(assignments_bp, url_prefix="/api/assignments")
    app.register_blueprint(admin_users_bp, url_prefix="/api/admin-users")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    # CLI seed command
    from .seed import seed_data

    @app.cli.command("seed")
    def seed_command():
        seed_data()
        print("Seed completed")

    return app
