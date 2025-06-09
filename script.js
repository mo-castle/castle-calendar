document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const monthYearEl = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    // const selectedDateEl = document.getElementById('selected-date'); // No longer used directly for prompt
    const moodPromptEl = document.getElementById('mood-prompt'); // Get the prompt element
    const selectedDatePlaceholderEl = document.getElementById('selected-date-placeholder'); // Get the placeholder span
    // const moodDisplayEl = document.getElementById('mood-display'); // Removed
    const moodButtons = document.querySelectorAll('.mood-btn'); // Gets 😊, 😥
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
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-enable calendar re-render
        updateMoodButtonHighlight(date); // Keep button highlight update
    }

    // Function to clear mood for a specific date
    function clearMood(date) {
        const moods = getMoods();
        if (moods[date]) { // Check if there is a mood to clear
            delete moods[date]; // Remove the entry for the date
            localStorage.setItem(moodStorageKey, JSON.stringify(moods));
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-enable calendar re-render
            updateMoodButtonHighlight(date); // Keep button highlight update
        }
    }

    // Function to update mood button highlights based on stored mood for the date
    function updateMoodButtonHighlight(date) {
        const moods = getMoods();
        const currentMood = moods[date];

        moodButtons.forEach(button => {
            if (button.dataset.mood === currentMood) {
                button.classList.add('selected-mood'); // Add highlight class
            } else {
                button.classList.remove('selected-mood'); // Remove highlight class
            }
        });
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

            // Re-add mood indicator container
            const moodIndicatorContainer = document.createElement('div');
            moodIndicatorContainer.classList.add('mood-indicator-container');
            dayCell.appendChild(moodIndicatorContainer);

            // Highlight today
            if (fullDate === todayString) {
                dayCell.classList.add('today');
            }

            // Re-add mood indicator adding logic
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

        // Re-apply selected class to the date cell if a date is currently selected
        // This is separate from mood button highlight
        if (selectedFullDate) {
            const selectedCell = calendarEl.querySelector(`.calendar-day[data-date="${selectedFullDate}"]`);
            if (selectedCell) {
                selectedCell.classList.add('selected');
                selectedDayElement = selectedCell; // Keep track of the selected cell element
            } else {
                 selectedDayElement = null;
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
        // displayMoodForSelectedDate(); // Removed call
        updateMoodButtonHighlight(fullDate); // Update button highlights for the selected date
    }

    // Removed displayMoodForSelectedDate function

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
                const clickedMood = button.dataset.mood;
                const moods = getMoods();
                const currentSavedMood = moods[selectedFullDate];

                // If the clicked button's mood is the same as the currently saved mood, clear it
                if (clickedMood === currentSavedMood) {
                    clearMood(selectedFullDate);
                } else {
                    // Otherwise, save the new mood
                    saveMood(selectedFullDate, clickedMood);
                }
            } else {
                alert('まず日付を選択してください。');
            }
        });
    });

    // Remove the separate event listener for clearMoodBtn

    function clearSelection() {
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = null;
        selectedFullDate = null;
        // Reset prompt to placeholder
        moodPromptEl.innerHTML = ''; // Clear existing text
        moodPromptEl.appendChild(selectedDatePlaceholderEl); // Re-add placeholder span
        // moodDisplayEl.textContent = '-'; // Removed

        // Clear mood button highlights
        moodButtons.forEach(button => button.classList.remove('selected-mood'));
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

    // --- Graph Logic ---
    const showGraphBtn = document.getElementById('show-graph');
    const graphContainer = document.getElementById('graph-container');
    const calendarElContainer = document.getElementById('calendar-controls');
    const calendarElMain = document.getElementById('calendar');
    const moodSection = document.getElementById('mood-section');
    const dataManagement = document.getElementById('data-management');
    const oneWeekBtn = document.getElementById('one-week');
    const oneMonthBtn = document.getElementById('one-month');
    const threeMonthBtn = document.getElementById('three-month');
    const oneYearBtn = document.getElementById('one-year');

    let graphRange = 30; // Default to 1 month
    let selectedRangeButton = oneMonthBtn; // Initially select 1 month button
    selectedRangeButton.classList.add('selected-range');

    function updateSelectedRangeButton(newButton) {
        selectedRangeButton.classList.remove('selected-range');
        newButton.classList.add('selected-range');
        selectedRangeButton = newButton;
    }

    showGraphBtn.addEventListener('click', () => {
        if (graphContainer.style.display === 'none') {
            calendarElContainer.style.display = 'none';
            calendarElMain.style.display = 'none';
            moodSection.style.display = 'none';
            dataManagement.style.display = 'none';
            graphContainer.style.display = 'block';
            renderMoodGraph();
            showGraphBtn.textContent = 'カレンダーを表示';
        } else {
            calendarElContainer.style.display = 'flex';
            calendarElMain.style.display = 'grid';
            moodSection.style.display = 'block';
            dataManagement.style.display = 'block';
            graphContainer.style.display = 'none';
            showGraphBtn.textContent = 'グラフを表示';
        }
    });

    oneWeekBtn.addEventListener('click', () => {
        graphRange = 7;
        updateSelectedRangeButton(oneWeekBtn);
        renderMoodGraph();
    });

    oneMonthBtn.addEventListener('click', () => {
        graphRange = 30;
        updateSelectedRangeButton(oneMonthBtn);
        renderMoodGraph();
    });

    threeMonthBtn.addEventListener('click', () => {
        graphRange = 90;
        updateSelectedRangeButton(threeMonthBtn);
        renderMoodGraph();
    });

    oneYearBtn.addEventListener('click', () => {
        graphRange = 365;
        updateSelectedRangeButton(oneYearBtn);
        renderMoodGraph();
    });

    let lastAdjustedMoodValue = 0; // Store the last adjusted mood value

    function renderMoodGraph() {
        const moods = getMoods();
        const today = new Date();
        const pastData = [];
        let adjustedValues = []; // Store adjusted values for the current graph

        for (let i = graphRange - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            let moodValue = 0;

            if (moods[dateString]) {
                if (moods[dateString] === '😊') {
                    moodValue = 1;
                } else if (moods[dateString] === '😥') {
                    moodValue = -1;
                }
            } else {
                moodValue = 0;
            }
            pastData.push(moodValue);
        }

        // Calculate adjusted mood values based on consecutive days
        const adjustedPastData = calculateAdjustedMoodValues(pastData);
        const ctx = document.getElementById('mood-chart').getContext('2d');
        // Destroy existing chart if it exists
        if (window.moodChart) {
            window.moodChart.destroy();
        }
        window.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: pastData.map((_, index) => {
                    const today = new Date();
                    const date = new Date(today);
                    date.setDate(today.getDate() - (graphRange - 1 - index));
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }),
                datasets: [{
                    label: 'Mood',
                    data: adjustedPastData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        min: -10,
                        max: 10
                    }
                }
            }
        });
    }

    function calculateAdjustedMoodValues(moodValues) {
        let adjustedValues = [];
        let consecutiveGoodDays = 0;
        let consecutiveBadDays = 0;

        for (let i = 0; i < moodValues.length; i++) {
            let moodValue = moodValues[i];
            let resultMoodValue = moodValue;

            if (moodValue > 0) {
                consecutiveGoodDays++;
                consecutiveBadDays = 0;
                if (consecutiveGoodDays >= 2) {
                    resultMoodValue = 2;
                }
            } else if (moodValue < 0) {
                consecutiveBadDays++;
                consecutiveGoodDays = 0;
                if (consecutiveBadDays >= 2) {
                    resultMoodValue = -2;
                }
            } else {
                consecutiveGoodDays = 0;
                consecutiveBadDays = 0;
            }

            if (i != 0) {
                resultMoodValue += adjustedValues[i-1];
                if (moodValue > 0) {
                    resultMoodValue = Math.min(resultMoodValue, 10);
                } else if (moodValue < 0) {
                    resultMoodValue = Math.max(resultMoodValue, -10);
                }
            }
            adjustedValues.push(resultMoodValue);
        }

        return adjustedValues;
    }
});
