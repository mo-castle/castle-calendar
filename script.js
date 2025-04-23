document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const monthYearEl = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    // const selectedDateEl = document.getElementById('selected-date'); // No longer used directly for prompt
    const moodPromptEl = document.getElementById('mood-prompt'); // Get the prompt element
    const selectedDatePlaceholderEl = document.getElementById('selected-date-placeholder'); // Get the placeholder span
    const moodDisplayEl = document.getElementById('mood-display');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const exportBtn = document.getElementById('export-data');

    let currentDate = new Date();
    let selectedDayElement = null;
    let selectedFullDate = null; // YYYY-MM-DD format

    // --- Local Storage ---
    const moodStorageKey = 'moodCalendarData';

    function getMoods() {
        const moods = localStorage.getItem(moodStorageKey);
        return moods ? JSON.parse(moods) : {};
    }

    function saveMood(date, mood) {
        const moods = getMoods();
        moods[date] = mood;
        localStorage.setItem(moodStorageKey, JSON.stringify(moods));
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-render to show indicator
        displayMoodForSelectedDate(); // Update display if the selected date was just updated
    }

    // --- Calendar Logic ---
    function renderCalendar(year, month) {
        calendarEl.innerHTML = ''; // Clear previous calendar
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

        monthYearEl.textContent = `${year}年 ${month + 1}月`;

        // Add day headers (Sun, Mon, ...)
        const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day', 'header');
            dayHeader.textContent = day;
            calendarEl.appendChild(dayHeader);
        });

        // Add empty cells for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'other-month');
            calendarEl.appendChild(emptyCell);
        }

        // Add day cells
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const moods = getMoods();

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = fullDate;

            // Create separate elements for date number and mood
            const dateNumber = document.createElement('span');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = day;
            dayCell.appendChild(dateNumber);

            const moodIndicatorContainer = document.createElement('div');
            moodIndicatorContainer.classList.add('mood-indicator-container');
            dayCell.appendChild(moodIndicatorContainer);


            // Highlight today
            if (fullDate === todayString) {
                dayCell.classList.add('today');
            }

            // Add mood indicator if mood exists (inside the container)
            if (moods[fullDate]) {
                const moodIndicator = document.createElement('span');
                moodIndicator.classList.add('mood-indicator');
                moodIndicator.textContent = moods[fullDate];
                moodIndicatorContainer.appendChild(moodIndicator); // Append to container
            }

            // Add click listener for date selection
            dayCell.addEventListener('click', () => selectDate(dayCell, fullDate));

            calendarEl.appendChild(dayCell);
        }

        // Re-apply selected class if a date is currently selected
        if (selectedFullDate) {
            const selectedCell = calendarEl.querySelector(`.calendar-day[data-date="${selectedFullDate}"]`);
            if (selectedCell) {
                selectedCell.classList.add('selected');
                // Ensure the selectedDayElement variable also points to the new element
                selectedDayElement = selectedCell;
            } else {
                // If the selected date is not in the current month view, clear selection visually
                // (This might happen if user selects a date then navigates months before mood save finishes re-render)
                 selectedDayElement = null; // Clear the reference
                 // selectedFullDate remains, so prompt stays correct until new selection
            }
        }
    }

    function selectDate(dayElement, fullDate) {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = dayElement;
        selectedDayElement.classList.add('selected');
        selectedFullDate = fullDate;
        // Update prompt text based on whether it's today or yesterday
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        const [year, month, day] = fullDate.split('-');
        const displayDate = `${parseInt(month)}/${parseInt(day)}`;

        if (fullDate === todayString) {
            moodPromptEl.textContent = `今日(${displayDate}) はどうだった？`;
        } else if (fullDate === yesterdayString) {
            moodPromptEl.textContent = `昨日(${displayDate}) はどうだった？`;
        } else {
            moodPromptEl.textContent = `${displayDate} はどうだった？`;
        }
        displayMoodForSelectedDate();
    }

    function displayMoodForSelectedDate() {
        if (selectedFullDate) {
            const moods = getMoods();
            moodDisplayEl.textContent = moods[selectedFullDate] || '-'; // Changed '記録なし' to '-'
        } else {
            moodDisplayEl.textContent = '-'; // Changed '記録なし' to '-'
        }
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        clearSelection();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        clearSelection();
    });

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedFullDate) {
                const mood = button.dataset.mood;
                saveMood(selectedFullDate, mood);
            } else {
                alert('まず日付を選択してください。');
            }
        });
    });

    function clearSelection() {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = null;
        selectedFullDate = null;
        // Reset prompt to placeholder
        moodPromptEl.innerHTML = ''; // Clear existing text
        moodPromptEl.appendChild(selectedDatePlaceholderEl); // Re-add placeholder span
        moodDisplayEl.textContent = '-'; // Changed '記録なし' to '-'
    }

    // --- Initial Load ---
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    // Select yesterday's date by default
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
    const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yesterdayCell = calendarEl.querySelector(`.calendar-day[data-date="${yesterdayString}"]`);

    // If yesterday is visible in the current month view, select it
    if (yesterdayCell && !yesterdayCell.classList.contains('other-month')) {
         selectDate(yesterdayCell, yesterdayString);
    } else {
        // If yesterday is not visible (e.g., it's the 1st of the month and yesterday was last month),
        // fall back to selecting today if visible, otherwise clear selection.
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayCell = calendarEl.querySelector(`.calendar-day[data-date="${todayString}"]`);
        if (todayCell) {
            selectDate(todayCell, todayString);
        }
    }

    // --- Data Export ---
    function exportData() {
        const moods = getMoods();
        if (Object.keys(moods).length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }

        const dataStr = JSON.stringify(moods, null, 2); // Pretty print JSON
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        link.download = `mood-calendar-data-${timestamp}.json`; // Suggest filename

        // Append to body, click, and remove (necessary for Firefox)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);


        URL.revokeObjectURL(url); // Clean up the object URL
    }

    exportBtn.addEventListener('click', exportData); // Added listener

});
