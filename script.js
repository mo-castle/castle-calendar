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
    // 不要なボタン・変数・イベントリスナーを削除
    //const showGraphBtn = document.getElementById('show-graph');
    //const graphContainer = document.getElementById('graph-container');
    //const calendarElContainer = document.getElementById('calendar-controls');
    //const calendarElMain = document.getElementById('calendar');
    //const moodSection = document.getElementById('mood-section');
    //const dataManagement = document.getElementById('data-management');
    //const oneWeekBtn = document.getElementById('one-week');
    const oneMonthBtn = document.getElementById('one-month');
    const threeMonthBtn = document.getElementById('three-month');
    const halfYearBtn = document.getElementById('half-year');
    const oneYearBtn = document.getElementById('one-year');

    // デフォルトは3か月
    let graphRange = 90;
    let selectedRangeButton = threeMonthBtn;
    selectedRangeButton.classList.add('selected-range');

    function updateSelectedRangeButton(newButton) {
        selectedRangeButton.classList.remove('selected-range');
        newButton.classList.add('selected-range');
        selectedRangeButton = newButton;
    }

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
    halfYearBtn.addEventListener('click', () => {
        graphRange = 180;
        updateSelectedRangeButton(halfYearBtn);
        renderMoodGraph();
    });
    oneYearBtn.addEventListener('click', () => {
        graphRange = 365;
        updateSelectedRangeButton(oneYearBtn);
        renderMoodGraph();
    });

    // グラフのcanvasサイズをウィンドウ幅に合わせて調整
    function resizeMoodChartCanvas() {
        const canvas = document.getElementById('mood-chart');
        const parent = canvas.parentElement;
        // 画面幅に応じて幅・高さを調整
        let w = Math.min(parent.offsetWidth * 0.98, 440);
        let h = Math.max(Math.round(w * 0.4), 100); // アスペクト比維持
        canvas.width = w;
        canvas.height = h;
    }

    // グラフ描画前にcanvasサイズを調整
    function renderMoodGraph() {
        resizeMoodChartCanvas();
        const moods = getMoods();
        const today = new Date();
        const moodHistory = [];
        const dateLabels = [];
        for (let i = graphRange - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            moodHistory.push(moods[dateString] || null);
            dateLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        const moodPoints = calculateMoodPoints(moodHistory);
        const ctx = document.getElementById('mood-chart').getContext('2d');
        if (window.moodChart) window.moodChart.destroy();
        window.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: '心のコンディション',
                    data: moodPoints,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: {
                        min: -15,
                        max: 15
                    }
                }
            }
        });
    }

    // pt計算ロジック（3回目以降は2倍）
    function calculateMoodPoints(moodHistory) {
        let points = [];
        let total = 0;
        let prevMood = null;
        let streak = 0;
        for (let i = 0; i < moodHistory.length; i++) {
            const mood = moodHistory[i];
            let delta = 0;
            if (mood === '😊') {
                if (prevMood === '😊') {
                    streak++;
                } else {
                    streak = 1;
                }
                delta = (streak >= 3) ? 2 : 1;
            } else if (mood === '😥') {
                if (prevMood === '😥') {
                    streak++;
                } else {
                    streak = 1;
                }
                delta = (streak >= 3) ? -2 : -1;
            } else {
                streak = 0;
                delta = 0;
            }
            prevMood = mood;
            total += delta;
            if (total > 15) total = 15;
            if (total < -15) total = -15;
            points.push(total);
        }
        return points;
    }

    // カレンダーやデータ変更時にグラフも更新
    renderMoodGraph();
    // mood保存時にもグラフ更新
    const originalSaveMood = saveMood;
    saveMood = function(date, mood) {
        originalSaveMood(date, mood);
        renderMoodGraph();
    };
    // mood削除時にもグラフ更新
    const originalClearMood = clearMood;
    clearMood = function(date) {
        originalClearMood(date);
        renderMoodGraph();
    };

    // ウィンドウリサイズ時にもグラフを再描画
    window.addEventListener('resize', () => {
        renderMoodGraph();
    });
});
