function isHoliday(dayType) {
    return (dayType.textContent.includes("休日"));
}

function selectRow(row) {
    if (skipHolidays && isHoliday(selectDayTypeFromRow(row))) {
        return;
    }
    selectElement(selectWorkStatusFromRow(row));
}

function deselectRow(row) {
    if (skipHolidays && isHoliday(selectDayTypeFromRow(row))) {
        return;
    }
    deselectElement(selectWorkStatusFromRow(row));
}

function toggleRow(row) {
    if (skipHolidays && isHoliday(selectDayTypeFromRow(row))) {
        return;
    }
    const workStatus = selectWorkStatusFromRow(row);
    if (selectedWorkStatuses.includes(workStatus)) {
        deselectRow(row);
    } else {
        selectRow(row);
    }
}

function selectElement(element) {
    if (!selectedWorkStatuses.includes(element)) {
        selectedWorkStatuses.push(element);
        element.classList.add('selectable-highlight');
    }
}

function deselectElement(element) {
    if (selectedWorkStatuses.includes(element)) {
        selectedWorkStatuses = selectedWorkStatuses.filter(el => el !== element);
        element.classList.remove('selectable-highlight');
    }
}

function handleElementMouseOver(e) {
    const element = e.target;
    if (!(element instanceof HTMLSelectElement) || !element.classList.contains('attendance-select-field')) {
        return;
    }
    let row = element;
    while (!row.classList.contains("v3")) {
        row = row.parentElement;
    }
    if (skipHolidays && isHoliday(selectDayTypeFromRow(row))) {
        return;
    }

    if (e.shiftKey) { // Select with Shift
        if (!selectedWorkStatuses.includes(selectWorkStatusFromRow(row))) {
            selectRow(row);
        }
    } else if (e.altKey) { // Deselect with Alt
        if (selectedWorkStatuses.includes(selectWorkStatusFromRow(row))) {
            deselectRow(row);
        }
    }
}

function initializeHoverSelection() {
    const container = document.body;
    container.addEventListener('mouseover', handleElementMouseOver);
}

function updateSelectOption(selectElement, valueToSelect) {
    if (selectElement && selectElement instanceof HTMLSelectElement) {
        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === valueToSelect) {
                selectElement.selectedIndex = i;
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
                break;
            }
        }
    } else {
        console.error('Provided element is not a SELECT dropdown or is null:', selectElement);
    }
}

// Select by day of the week
function selectByDay(day) {
    selectAllRows()
        .forEach(row => {
            if (selectDayFromRow(row).textContent.includes(day)) {
                toggleRow(row);
            }
    });
}

function selectAll() {
    const allRows = selectAllRows();

    allRows.forEach(row => {
        if (skipHolidays && isHoliday(selectDayTypeFromRow(row))) {
            return;
        }

        const workStatus = selectWorkStatusFromRow(row);
        if (!selectedWorkStatuses.includes(workStatus)) {
            selectElement(workStatus);
        }
    });
}

function deselectAll() {
    selectedWorkStatuses
        .forEach(workStatus => {
            deselectElement(workStatus);
        })
}

function invert() {
    selectAllRows()
        .forEach(row => {
            const workStatus = selectWorkStatusFromRow(row);
            if (selectedWorkStatuses.includes(workStatus)) {
                deselectRow(row);
            } else {
                selectRow(row);
            }
        })
}

function toggleSkipHolidays(event) {
    skipHolidays = event.target.checked;
}

function selectAllRows() {
    return document.querySelectorAll(".attendance-table-contents tr.v3");
}

function selectAllWorkStatuses() {
    return document.querySelectorAll(".column-pattern .attendance-select-field");
}

function selectWorkStatusFromRow(row) {
    return row.querySelector(".column-pattern .attendance-select-field");
}

function selectDayFromRow(row) {
    return row.querySelector(".column-day");
}

function selectDayTypeFromRow(row) {
    return row.querySelector(".column-classification");
}