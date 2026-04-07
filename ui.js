const DAYS_IN_WEEK = 7;

function createPaintSelectMenu() {
    // Find the first attendance select field to copy options from
    const firstSelect = document.querySelector('.attendance-select-field');
    if (!firstSelect) {
        console.error('Could not find any attendance select fields to copy options from');
        return null;
    }

    const select = document.createElement("select");
    select.style.marginLeft = "4px";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- 選択 --";
    select.appendChild(defaultOption);

    const blankOption = document.createElement("option");
    blankOption.value = "";
    blankOption.textContent = "【リセット】";
    select.appendChild(blankOption);

    // Copy all options from the actual attendance select field
    Array.from(firstSelect.options).forEach(originalOption => {
        if (originalOption.value) { // Skip empty values
            const option = document.createElement("option");
            option.value = originalOption.value;
            option.textContent = originalOption.textContent;
            select.appendChild(option);
        }
    });

    return select;
}

function createApplyButton() {
    const applyButton = document.createElement("button");
    applyButton.textContent = "変更";
    applyButton.style.marginLeft = "5px";
    applyButton.addEventListener("click", () => {
        paintCells();
    });
    return applyButton;
}

function createSelectAllButton() {
    const button = document.createElement("button");
    button.textContent = "全て";
    button.addEventListener("click", () => {
        selectAll();
    });
    return button;
}

function createDeselectAllButton() {
    const button = document.createElement("button");
    button.textContent = "全選択解除";
    button.style.marginLeft = "5px";
    button.addEventListener("click", () => {
        deselectAll();
    });
    return button;
}

function createInvertButton() {
    const button = document.createElement("button");
    button.textContent = "反対";
    button.addEventListener('click', () => {
        invert();
    });
    return button;
}

function createSkipEmptyCheckbox() {
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = "休日以外： ";
    checkboxLabel.style.marginLeft = "10px";

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = skipHolidays;

    checkbox.addEventListener('change', (event) => {
        toggleSkipHolidays(event);
    });

    checkboxLabel.appendChild(checkbox);
    return checkboxLabel;
}

const days = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
];

function createDaySelector() {
    const dayList = document.createElement('p');
    for (let i = 0; i < DAYS_IN_WEEK; ++i) {
        const dayButton = document.createElement('button');
        dayButton.textContent = days[i];
        dayButton.addEventListener("click", () => {
            selectByDay(dayButton.textContent);
        })
        dayList.appendChild(dayButton);
    }
    return dayList;
}