
const API = "/api/tickets";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function statusClass(status) {
    if (status === "Open") return "status-open";
    if (status === "In Progress") return "status-progress";
    if (status === "Resolved") return "status-resolved";
    return "";
}

function priorityClass(priority) {
    if (priority === "Low") return "priority-low";
    if (priority === "Medium") return "priority-medium";
    if (priority === "High") return "priority-high";
    return "";
}


// CUSTOMER: CREATE TICKET
const ticketForm = document.getElementById("ticketForm");

if (ticketForm) {
    ticketForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("formMessage");
        const button = ticketForm.querySelector("button[type='submit']");

        const data = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            subject: document.getElementById("subject").value.trim(),
            category: document.getElementById("category").value,
            priority: document.getElementById("priority").value,
            description: document.getElementById("description").value.trim()
        };

        button.disabled = true;
        button.textContent = "Submitting...";

        try {
            const response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            message.innerHTML = `
                <div class="success-message">
                    <strong>Ticket submitted successfully!</strong><br>
                    Your Ticket ID is:
                    <strong>${escapeHTML(result.ticket_id)}</strong><br>
                    Please save this ID to track your ticket.
                </div>
            `;

            ticketForm.reset();

        } catch (error) {
            message.innerHTML = `
                <div class="error-message">
                    ${escapeHTML(error.message)}
                </div>
            `;
        } finally {
            button.disabled = false;
            button.textContent = "Submit Ticket →";
        }
    });
}


// CUSTOMER: TRACK TICKET
async function trackTickets() {
    const search = document.getElementById("trackSearch");
    const results = document.getElementById("trackingResults");

    if (!search || !results) return;

    const term = search.value.trim();

    if (!term) {
        results.innerHTML = `
            <div class="error-message">
                Please enter a ticket ID or search term.
            </div>
        `;
        return;
    }

    results.innerHTML = "<p>Searching tickets...</p>";

    try {
        const response = await fetch(
            `${API}?search=${encodeURIComponent(term)}`
        );

        const tickets = await response.json();

        if (!tickets.length) {
            results.innerHTML = `
                <div class="empty-state">
                    <p>No matching tickets found.</p>
                </div>
            `;
            return;
        }

        results.innerHTML = tickets.map(ticket => `
            <div class="ticket-result">
                <span class="ticket-id">
                    ${escapeHTML(ticket.ticket_id)}
                </span>

                <h3>${escapeHTML(ticket.subject)}</h3>

                <p>
                    Category: ${escapeHTML(ticket.category)}
                </p>

                <p>
                    Priority:
                    <span class="priority ${priorityClass(ticket.priority)}">
                        ${escapeHTML(ticket.priority)}
                    </span>
                </p>

                <p>
                    Status:
                    <span class="status ${statusClass(ticket.status)}">
                        ${escapeHTML(ticket.status)}
                    </span>
                </p>

                <p>
                    Submitted: ${escapeHTML(ticket.created_at)}
                </p>

                <p class="ticket-description">
                    ${escapeHTML(ticket.description)}
                </p>
            </div>
        `).join("");

    } catch (error) {
        results.innerHTML = `
            <div class="error-message">
                Unable to search tickets. Please try again.
            </div>
        `;
    }
}

const trackBtn = document.getElementById("trackBtn");

if (trackBtn) {
    trackBtn.addEventListener("click", trackTickets);
}

const trackSearch = document.getElementById("trackSearch");

if (trackSearch) {
    trackSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            trackTickets();
        }
    });
}


// ADMIN: LOAD DASHBOARD
async function loadDashboard() {
    const tableBody = document.getElementById("ticketTableBody");

    if (!tableBody) return;

    try {
        const [statsResponse, ticketsResponse] = await Promise.all([
            fetch("/api/stats"),
            fetch(API)
        ]);

        const stats = await statsResponse.json();
        const tickets = await ticketsResponse.json();

        document.getElementById("totalCount").textContent = stats.total;
        document.getElementById("openCount").textContent = stats.open;
        document.getElementById("progressCount").textContent = stats.in_progress;
        document.getElementById("resolvedCount").textContent = stats.resolved;

        renderAdminTickets(tickets);

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">Unable to load tickets.</td>
            </tr>
        `;
    }
}


// ADMIN: RENDER TICKETS
function renderAdminTickets(tickets) {
    const tableBody = document.getElementById("ticketTableBody");
    const emptyState = document.getElementById("adminEmpty");

    if (!tableBody) return;

    if (tickets.length === 0) {
        tableBody.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    tableBody.innerHTML = tickets.map(ticket => `
        <tr>
            <td>
                <strong>${escapeHTML(ticket.ticket_id)}</strong>
            </td>

            <td>
                <div class="customer-name">
                    ${escapeHTML(ticket.name)}
                </div>
                <div class="customer-email">
                    ${escapeHTML(ticket.email)}
                </div>
            </td>

            <td>${escapeHTML(ticket.subject)}</td>
            <td>${escapeHTML(ticket.category)}</td>

            <td>
                <span class="priority ${priorityClass(ticket.priority)}">
                    ${escapeHTML(ticket.priority)}
                </span>
            </td>

            <td>
                <select class="status-select"
                    onchange="updateStatus('${ticket.ticket_id}', this.value)">
                    <option ${ticket.status === "Open" ? "selected" : ""}>
                        Open
                    </option>
                    <option ${ticket.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>
                    <option ${ticket.status === "Resolved" ? "selected" : ""}>
                        Resolved
                    </option>
                </select>
            </td>

            <td>${escapeHTML(ticket.created_at)}</td>

            <td>
                <button class="delete-btn"
                    onclick="deleteTicket('${ticket.ticket_id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}


// ADMIN: UPDATE STATUS
async function updateStatus(ticketId, status) {
    try {
        const response = await fetch(
            `${API}/${encodeURIComponent(ticketId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Update failed");
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ADMIN: DELETE TICKET
async function deleteTicket(ticketId) {
    const confirmed = confirm(
        `Are you sure you want to delete ${ticketId}?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API}/${encodeURIComponent(ticketId)}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Delete failed");
        }

        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ADMIN: SEARCH AND FILTER
async function filterAdminTickets() {
    const search = document.getElementById("adminSearch");
    const status = document.getElementById("statusFilter");
    const priority = document.getElementById("priorityFilter");

    if (!search || !status || !priority) return;

    const params = new URLSearchParams();

    params.set("search", search.value.trim());
    params.set("status", status.value);
    params.set("priority", priority.value);

    try {
        const response = await fetch(`${API}?${params.toString()}`);
        const tickets = await response.json();

        renderAdminTickets(tickets);
    } catch (error) {
        console.error("Filter error:", error);
    }
}

const adminSearch = document.getElementById("adminSearch");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

if (adminSearch) {
    adminSearch.addEventListener("input", filterAdminTickets);
}

if (statusFilter) {
    statusFilter.addEventListener("change", filterAdminTickets);
}

if (priorityFilter) {
    priorityFilter.addEventListener("change", filterAdminTickets);
}


// Automatically load dashboard only on Admin page
if (document.getElementById("ticketTableBody")) {
    loadDashboard();
}
