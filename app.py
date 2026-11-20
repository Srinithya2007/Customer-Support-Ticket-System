
from flask import Flask, render_template, request, jsonify
import sqlite3
import uuid
from datetime import datetime

app = Flask(__name__)

DATABASE = "tickets.db"


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Open',
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


# Create a new ticket
@app.route("/api/tickets", methods=["POST"])
def create_ticket():
    data = request.get_json()

    required_fields = [
        "name", "email", "subject",
        "category", "priority", "description"
    ]

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return jsonify({"error": f"{field} is required"}), 400

    ticket_id = "TKT-" + uuid.uuid4().hex[:8].upper()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

    conn = get_db()

    conn.execute("""
        INSERT INTO tickets
        (ticket_id, name, email, subject, category,
         priority, description, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id,
        data["name"].strip(),
        data["email"].strip(),
        data["subject"].strip(),
        data["category"],
        data["priority"],
        data["description"].strip(),
        "Open",
        created_at
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Ticket created successfully",
        "ticket_id": ticket_id
    }), 201


# Get tickets / search tickets / filter tickets
@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()
    priority = request.args.get("priority", "").strip()

    conn = get_db()

    query = "SELECT * FROM tickets WHERE 1=1"
    params = []

    if search:
        query += """
            AND (
                ticket_id LIKE ?
                OR name LIKE ?
                OR email LIKE ?
                OR subject LIKE ?
            )
        """
        search_term = f"%{search}%"
        params.extend([search_term] * 4)

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)

    query += " ORDER BY id DESC"

    tickets = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(ticket) for ticket in tickets])


# Dashboard statistics
@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn = get_db()

    total = conn.execute(
        "SELECT COUNT(*) FROM tickets"
    ).fetchone()[0]

    open_count = conn.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='Open'"
    ).fetchone()[0]

    progress_count = conn.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='In Progress'"
    ).fetchone()[0]

    resolved_count = conn.execute(
        "SELECT COUNT(*) FROM tickets WHERE status='Resolved'"
    ).fetchone()[0]

    conn.close()

    return jsonify({
        "total": total,
        "open": open_count,
        "in_progress": progress_count,
        "resolved": resolved_count
    })


# Update ticket status
@app.route("/api/tickets/<ticket_id>", methods=["PUT"])
def update_ticket(ticket_id):
    data = request.get_json()

    allowed_statuses = ["Open", "In Progress", "Resolved"]

    if not data or data.get("status") not in allowed_statuses:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db()

    cursor = conn.execute("""
        UPDATE tickets
        SET status = ?
        WHERE ticket_id = ?
    """, (data["status"], ticket_id))

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Ticket not found"}), 404

    return jsonify({"message": "Ticket updated successfully"})


# Delete ticket
@app.route("/api/tickets/<ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    conn = get_db()

    cursor = conn.execute(
        "DELETE FROM tickets WHERE ticket_id = ?",
        (ticket_id,)
    )

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Ticket not found"}), 404

    return jsonify({"message": "Ticket deleted successfully"})


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)
