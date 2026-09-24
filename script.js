const state = {
    currentDate: new Date(2026, 8, 23),
    selectedDate: new Date(2026, 8, 23),
    events: {
        "2026-09-23": {
            title: "Barangay Waste Collection",
            time: "07:00",
            area: "Street 1, Street 2, Street 3 & Street 4",
            wasteType: "All Waste",
            status: "scheduled",
            notes: "Regular barangay garbage and waste collection."
        },
        "2026-09-25": {
            title: "Recyclable Waste Collection",
            time: "08:00",
            area: "Street 2 & Street 4",
            wasteType: "Recyclable",
            status: "scheduled",
            notes: "Please separate recyclable materials before collection."
        },
        "2026-09-30": {
            title: "Monthly Residual Waste Collection",
            time: "07:00",
            area: "All Streets",
            wasteType: "Residual",
            status: "scheduled",
            notes: ""
        }
    },
    streetWaste: {
        "2026-09-23": [
            ["Street 1", 120],
            ["Street 2", 85],
            ["Street 3", 150],
            ["Street 4", 62]
        ]
    }
};

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const calendarGrid = document.getElementById("calendarGrid");
const calendarMonth = document.getElementById("calendarMonth");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const eventDetails = document.getElementById("eventDetails");
const streetWasteList = document.getElementById("streetWasteList");
const selectedTotal = document.getElementById("selectedTotal");

const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");

const eventTitle = document.getElementById("eventTitle");
const eventDateInput = document.getElementById("eventDateInput");
const eventTime = document.getElementById("eventTime");
const eventArea = document.getElementById("eventArea");
const eventWasteType = document.getElementById("eventWasteType");
const eventStatus = document.getElementById("eventStatus");
const eventNotes = document.getElementById("eventNotes");
const modalTitle = document.getElementById("modalTitle");

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function statusLabel(status) {
    return {
        scheduled: "Scheduled",
        completed: "Completed",
        missed: "Missed"
    }[status] || "Scheduled";
}

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    calendarMonth.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const key = dateKey(date);
        const event = state.events[key];

        const cell = document.createElement("button");
        cell.className = "calendar-day";
        cell.type = "button";

        if (key === dateKey(state.selectedDate)) {
            cell.classList.add("selected");
        }

        cell.innerHTML = `<span class="day-number">${day}</span>`;

        if (event) {
            const indicator = document.createElement("span");
            indicator.className = `calendar-indicator ${event.status || "event"}`;
            cell.appendChild(indicator);
        }

        cell.addEventListener("click", () => {
            state.selectedDate = date;
            renderCalendar();
            renderSelectedDate();
        });

        cell.addEventListener("dblclick", () => {
            openEventModal(key);
        });

        calendarGrid.appendChild(cell);
    }
}

function renderSelectedDate() {
    const key = dateKey(state.selectedDate);
    selectedDateLabel.textContent = formatDate(state.selectedDate);

    const event = state.events[key];

    if (event) {
        eventDetails.innerHTML = `
            <div class="event-title">${escapeHtml(event.title)}</div>
            <div class="event-meta">
                <span>🕒 ${formatTime(event.time)}</span>
                <span>•</span>
                <span>📍 ${escapeHtml(event.area)}</span>
            </div>
            <div class="event-meta">
                <span>♻ ${escapeHtml(event.wasteType)}</span>
                <span>•</span>
                <span>${statusLabel(event.status)}</span>
            </div>
            ${event.notes ? `<div class="event-note">${escapeHtml(event.notes)}</div>` : ""}
        `;
    } else {
        eventDetails.innerHTML = `
            <div class="event-title">No collection event</div>
            <div class="event-meta">No event has been scheduled for this date.</div>
        `;
    }

    const rows = state.streetWaste[key] || [];
    const total = rows.reduce((sum, row) => sum + row[1], 0);

    selectedTotal.textContent = `${total.toLocaleString()} kg`;

    if (rows.length) {
        streetWasteList.innerHTML = rows.map(row => `
            <div class="waste-row">
                <span>${escapeHtml(row[0])}</span>
                <span>${row[1]} kg</span>
            </div>
        `).join("");
    } else {
        streetWasteList.innerHTML = `
            <div class="waste-row">
                <span>No collection data yet</span>
                <span>—</span>
            </div>
        `;
    }
}

function formatTime(time) {
    if (!time) return "Time not set";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function openEventModal(key = dateKey(state.selectedDate)) {
    const existing = state.events[key];

    modalTitle.textContent = existing ? "Edit Collection Event" : "Add Collection Event";

    eventDateInput.value = key;
    eventTitle.value = existing?.title || "Barangay Waste Collection";
    eventTime.value = existing?.time || "07:00";
    eventArea.value = existing?.area || "";
    eventWasteType.value = existing?.wasteType || "All Waste";
    eventStatus.value = existing?.status || "scheduled";
    eventNotes.value = existing?.notes || "";

    eventModal.classList.add("show");
}

function closeEventModal() {
    eventModal.classList.remove("show");
}

document.getElementById("addEventButton").addEventListener("click", () => {
    openEventModal(dateKey(state.selectedDate));
});

document.getElementById("editSelectedButton").addEventListener("click", () => {
    openEventModal(dateKey(state.selectedDate));
});

document.getElementById("closeModal").addEventListener("click", closeEventModal);
document.getElementById("cancelModal").addEventListener("click", closeEventModal);

eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) closeEventModal();
});

eventForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const key = eventDateInput.value;

    state.events[key] = {
        title: eventTitle.value.trim(),
        time: eventTime.value,
        area: eventArea.value.trim(),
        wasteType: eventWasteType.value,
        status: eventStatus.value,
        notes: eventNotes.value.trim()
    };

    const selected = new Date(`${key}T12:00:00`);
    state.selectedDate = selected;

    if (
        selected.getMonth() !== state.currentDate.getMonth() ||
        selected.getFullYear() !== state.currentDate.getFullYear()
    ) {
        state.currentDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
    }

    closeEventModal();
    renderCalendar();
    renderSelectedDate();
});

document.getElementById("previousMonth").addEventListener("click", () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById("mobileMenu").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        const section = button.dataset.section;
        const dashboard = document.getElementById("dashboardSection");
        const placeholder = document.getElementById("placeholderSection");

        if (section === "dashboard") {
            dashboard.style.display = "block";
            placeholder.style.display = "none";
            return;
        }

        dashboard.style.display = "none";
        placeholder.style.display = "block";

        const title = section.charAt(0).toUpperCase() + section.slice(1);
        document.getElementById("placeholderTitle").textContent = title;

        document.getElementById("sidebar").classList.remove("open");
    });
});

document.getElementById("backToDashboard").addEventListener("click", () => {
    document.querySelector('[data-section="dashboard"]').click();
});

document.getElementById("searchInput").addEventListener("input", (event) => {
    console.log("Prototype search:", event.target.value);
});

/* Charts */
const wasteTypeChart = new Chart(
    document.getElementById("wasteTypeChart"),
    {
        type: "doughnut",
        data: {
            labels: ["Biodegradable", "Recyclable", "Residual", "Other"],
            datasets: [{
                data: [1620, 1240, 1120, 305],
                backgroundColor: ["#2b9b6a", "#368fd1", "#e6a02a", "#7951b8"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${context.raw} kg`
                    }
                }
            }
        }
    }
);

const collectionTrendChart = new Chart(
    document.getElementById("collectionTrendChart"),
    {
        type: "line",
        data: {
            labels: ["Sep 1", "Sep 5", "Sep 10", "Sep 15", "Sep 20", "Sep 25", "Sep 30"],
            datasets: [{
                label: "Waste collected",
                data: [72, 91, 108, 128, 145, 171, 158],
                borderColor: "#23845d",
                backgroundColor: "rgba(42, 155, 106, .10)",
                fill: true,
                tension: .35,
                pointRadius: 3,
                pointBackgroundColor: "#23845d"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `${value} kg`
                    },
                    grid: {
                        color: "#edf2ef"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    }
);

/* Initial render */
renderCalendar();
renderSelectedDate();
