// script.js (combined for all pages: index.html, favorites.html, statistics.html, goals.html, and achievements)
let Achievements = JSON.parse(localStorage.getItem("achievements")) || [];

document.addEventListener("DOMContentLoaded", function () {
    // Shared data storage
    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    let CurrentWeight = JSON.parse(localStorage.getItem("CurrentWeight")) || [];
    let currentGoal = JSON.parse(localStorage.getItem("currentGoal")) || {
        exercise: "",
        duration: 0,
        weightLoss: 0,
        startDate: ""
    };
    let lastWorkout = JSON.parse(localStorage.getItem("lastWorkout")) || {
        duration: 0,
        weight: 0
    };

    // Detect the current page
    const isIndexPage = document.getElementById("workoutForm") !== null;
    const isFavoritesPage = document.getElementById("favoriteList") !== null;
    const isStatsPage = document.getElementById("stats") !== null;
    const isGoalsPage = document.getElementById("goalForm") !== null;
    const isACVPage = document.getElementById("ACV") !== null;

    // Common navbar toggle for all pages
    document.querySelector(".navbar-toggler")?.addEventListener("click", function () {
        let navbarCollapse = document.getElementById("navbarNav");
        navbarCollapse.style.display = navbarCollapse.style.display === "block" ? "none" : "block";
    });

    // Load stored data for goals
    loadStoredData();

    if (isACVPage) {
        updateAchievements();
        ViewAchievements();
    }

    // Index.html-specific logic (Workout Logging)
    if (isIndexPage) {
        renderWorkouts();

        document.getElementById("workoutForm").addEventListener("submit", function (event) {
            event.preventDefault();

            let type = document.getElementById("workoutType").value;
            let duration = parseInt(document.getElementById("duration").value);
            let weight = parseInt(document.getElementById("weight").value);
            let date = document.getElementById("workoutDate").value;

            if (!isNaN(weight)) {
                CurrentWeight.push(weight);
                localStorage.setItem("CurrentWeight", JSON.stringify(CurrentWeight));
            }

            lastWorkout.duration = duration;
            lastWorkout.weight = weight;
            localStorage.setItem("lastWorkout", JSON.stringify(lastWorkout));

            let calories = calculateCalories(type, weight, duration);

            if (type && duration && date) {
                let workout = { type, duration, calories: parseFloat(calories), date, favorite: false };
                workouts.push(workout);
                localStorage.setItem("workouts", JSON.stringify(workouts));
                renderWorkouts();
                updateStats();
                updateAchievements();
                document.getElementById("workoutForm").reset();
                AchivementPopup();
                document.getElementById("Achivement-message").innerHTML = "You have logged " + workouts.length + " workouts!";
            }
        });

        document.getElementById("viewWorkoutsBtn")?.addEventListener("click", function () {
            let workoutSection = document.getElementById("workoutSection");
            workoutSection.style.display = workoutSection.style.display === "none" ? "block" : "none";
        });
    }

    // Favorites.html-specific logic
    if (isFavoritesPage) {
        renderFavoriteWorkouts();
    }

    // Statistics.html-specific logic
    if (isStatsPage) {
        updateStats();
    }

    // Goals.html-specific logic
    if (isGoalsPage) {
        const goalForm = document.getElementById("goalForm");
        if (goalForm) {
            goalForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const exercise = document.getElementById("goalExercise").value;
                const duration = parseInt(document.getElementById("goalDuration").value);
                const weightLoss = parseFloat(document.getElementById("goalWeightLoss").value);
                const startDate = document.getElementById("goalStartDate").value;

                currentGoal = { exercise, duration, weightLoss, startDate };
                localStorage.setItem("currentGoal", JSON.stringify(currentGoal));
                displayGoals();
                goalForm.reset();
            });
        }

        document.getElementById("viewGoalsBtn")?.addEventListener("click", function () {
            let goalList = document.getElementById("goalList");
            if (goalList.style.display === "none" || goalList.style.display === "") {
                displayGoals();
                goalList.style.display = "block";
            } else {
                goalList.style.display = "none";
            }
        });
        
        document.getElementById("viewProgressBtn")?.addEventListener("click", function () {
            let progressSection = document.getElementById("progressSection");
            if (progressSection.style.display === "none" || progressSection.style.display === "") {
                displayProgress();
                progressSection.style.display = "block";
            } else {
                progressSection.style.display = "none";
            }
        });
    }

    // Shared function to calculate calories burned
    function calculateCalories(workoutType, weight, duration) {
        const calorieBurnRates = {
            "Running": 10,
            "Cycling": 8,
            "Strength Training": 6,
            "Aerobics": 7,
            "Pilates": 5,
            "Swimming": 7,
            "Yoga": 3,
            "Balance Workout": 4
        };
        const burnRate = calorieBurnRates[workoutType] || 0;
        return (burnRate * weight * (duration / 60)).toFixed(2);
    }

    // Render workouts (index.html)
    function renderWorkouts() {
        let workoutList = document.getElementById("workoutList");
        if (!workoutList) return;
        workoutList.innerHTML = "";

        workouts.forEach((workout, index) => {
            let listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `
                <strong>${workout.type}</strong> - ${workout.duration} min - ${workout.calories} kcal - ${workout.date}
                <button class='btn btn-warning btn-sm float-right' onclick='toggleFavorite(${index})'>⭐</button>
                <button class='btn btn-danger btn-sm float-right mr-2' onclick='removeWorkout(${index})'>X</button>
            `;
            workoutList.appendChild(listItem);
        });
    }

    // Render favorite workouts (favorites.html)
    function renderFavoriteWorkouts() {
        let favoriteList = document.getElementById("favoriteList");
        if (!favoriteList) return;
        favoriteList.innerHTML = "";

        let favoriteWorkouts = workouts.filter(workout => workout.favorite);

        if (favoriteWorkouts.length === 0) {
            let emptyMessage = document.createElement("li");
            emptyMessage.classList.add("list-group-item");
            emptyMessage.textContent = "No favorite workouts yet. Mark some from the workout log!";
            favoriteList.appendChild(emptyMessage);
        } else {
            favoriteWorkouts.forEach((workout) => {
                let listItem = document.createElement("li");
                listItem.classList.add("list-group-item");
                listItem.innerHTML = `
                    <strong>${workout.type}</strong> - ${workout.duration} min - ${workout.calories} kcal - ${workout.date}
                    <button class='btn btn-warning btn-sm float-right' onclick='toggleFavorite(${workouts.indexOf(workout)})'>⭐</button>
                `;
                favoriteList.appendChild(listItem);
            });
        }
    }

    // Remove a workout (shared across pages)
    window.removeWorkout = function (index) {
        workouts.splice(index, 1);
        localStorage.setItem("workouts", JSON.stringify(workouts));
        if (isIndexPage) renderWorkouts();
        if (isFavoritesPage) renderFavoriteWorkouts();
        if (isStatsPage) updateStats();
        if (isACVPage) updateAchievements();
        document.getElementById("Achivement-message").innerHTML = "You deleted a workout!";
        AchivementPopup();
    };

    // Toggle favorite status (shared across pages)
    window.toggleFavorite = function (index) {
        workouts[index].favorite = !workouts[index].favorite;
        localStorage.setItem("workouts", JSON.stringify(workouts));
        if (isIndexPage) renderWorkouts();
        if (isFavoritesPage) renderFavoriteWorkouts();
        if (isStatsPage) updateStats();
        document.getElementById("Achivement-message").innerHTML = "You Favorited a workout!";
        AchivementPopup();
    };

    // Update statistics (statistics.html)
    function updateStats() {
        let totalWorkouts = workouts.length;
        let totalCalories = workouts.reduce((sum, workout) => sum + parseFloat(workout.calories), 0);
        let averageDuration = (workouts.reduce((sum, workout) => sum + workout.duration, 0) / totalWorkouts) || 0;

        let totalWorkoutsElem = document.getElementById("totalWorkouts");
        let totalCaloriesElem = document.getElementById("totalCalories");
        let averageDurationElem = document.getElementById("averageDuration");

        if (totalWorkoutsElem && totalCaloriesElem && averageDurationElem) {
            totalWorkoutsElem.textContent = totalWorkouts;
            totalCaloriesElem.textContent = totalCalories.toFixed(2);
            averageDurationElem.textContent = averageDuration.toFixed(2);
        }

        renderCharts();
    }

    // Render charts (statistics.html)
    function renderCharts() {
        let barCtx = document.getElementById("workoutChart")?.getContext("2d");
        if (barCtx && workouts.length > 0) {
            let labels = workouts.map(workout => workout.date);
            let data = workouts.map(workout => workout.calories);

            new Chart(barCtx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Calories Burned per Workout",
                        data: data,
                        backgroundColor: "rgba(255, 140, 0, 0.2)",
                        borderColor: "rgba(255, 140, 0, 1)",
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, ticks: { color: "#ffffff" } },
                        x: { ticks: { color: "#ffffff" } }
                    },
                    plugins: {
                        legend: { labels: { color: "#ffffff" } },
                        title: { display: true, text: "Calories Burned per Workout", color: "#ffffff" }
                    }
                }
            });
        }

        let lineCtx = document.getElementById("lineChart")?.getContext("2d");
        if (lineCtx && workouts.length > 0) {
            let caloriesByDate = {};
            workouts.forEach(workout => {
                caloriesByDate[workout.date] = (caloriesByDate[workout.date] || 0) + parseFloat(workout.calories);
            });

            let lineLabels = Object.keys(caloriesByDate).sort();
            let lineData = lineLabels.map(date => caloriesByDate[date]);

            new Chart(lineCtx, {
                type: "line",
                data: {
                    labels: lineLabels,
                    datasets: [{
                        label: "Total Calories per Day",
                        data: lineData,
                        fill: false,
                        borderColor: "rgba(0, 123, 255, 1)",
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, ticks: { color: "#ffffff" } },
                        x: { ticks: { color: "#ffffff" } }
                    },
                    plugins: {
                        legend: { labels: { color: "#ffffff" } },
                        title: { display: true, text: "Total Calories per Day", color: "#ffffff" }
                    }
                }
            });
        }

        let pieCtx = document.getElementById("pieChart")?.getContext("2d");
        if (pieCtx && workouts.length > 0) {
            let durationByType = {};
            workouts.forEach(workout => {
                durationByType[workout.type] = (durationByType[workout.type] || 0) + workout.duration;
            });

            let pieLabels = Object.keys(durationByType);
            let pieData = Object.values(durationByType);

            new Chart(pieCtx, {
                type: "pie",
                data: {
                    labels: pieLabels,
                    datasets: [{
                        label: "Time by Workout Type (min)",
                        data: pieData,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.7)",
                            "rgba(54, 162, 235, 0.7)",
                            "rgba(255, 206, 86, 0.7)",
                            "rgba(75, 192, 192, 0.7)",
                            "rgba(153, 102, 255, 0.7)",
                            "rgba(255, 159, 64, 0.7)",
                            "rgba(199, 199, 199, 0.7)",
                            "rgba(83, 102, 255, 0.7)"
                        ]
                    }]
                },
                options: {
                    plugins: {
                        legend: { labels: { color: "#ffffff" } },
                        title: { display: true, text: "Time by Workout Type (min)", color: "#ffffff" }
                    }
                }
            });
        }
    }

    // Achievements-related functions
    function updateAchievements() {
        let totalWorkouts = workouts.length;
        let totalCalories = workouts.reduce((sum, workout) => sum + parseFloat(workout.calories), 0);
        let totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);

        let newAchievements = [];

        // Progress bars
        let ACVworkoutProgress = document.getElementById("ACVworkoutProgress");
        let ACVcalorieProgress = document.getElementById("ACVcalorieProgress");
        let ACVminuteProgress = document.getElementById("ACVminuteProgress");

        if (ACVworkoutProgress && ACVcalorieProgress && ACVminuteProgress) {
            ACVworkoutProgress.style.width = `${(totalWorkouts % 5) / 5 * 100}%`;
            ACVcalorieProgress.style.width = `${(totalCalories % 1000) / 1000 * 100}%`;
            ACVminuteProgress.style.width = `${(totalMinutes % 60) / 60 * 100}%`;
        }

        if (workouts.length > 0) {
            newAchievements.push("🎉 You have logged your first workout!");
        }

        let workoutMilestone = Math.floor(totalWorkouts / 5) * 5;
        if (workoutMilestone > 0) {
            newAchievements.push(`🏆 Logged ${workoutMilestone} Workouts! Next milestone: ${workoutMilestone + 5} workouts`);
        }

        let calorieMilestone = Math.floor(totalCalories / 1000) * 1000;
        if (calorieMilestone > 0) {
            newAchievements.push(`🔥 Burned ${calorieMilestone} Calories! Next milestone: ${calorieMilestone + 1000} calories`);
        }

        let timeMilestone = Math.floor(totalMinutes / 120) * 120;
        if (timeMilestone > 0) {
            newAchievements.push(`⏳ Exercised for ${timeMilestone} Minutes! Next milestone: ${timeMilestone + 120} minutes`);
        }

        if (newAchievements.length > 0) {
            Achievements = newAchievements;
            localStorage.setItem("achievements", JSON.stringify(Achievements));
        }
        if (isACVPage) ViewAchievements();
    }

    function ViewAchievements() {
        const AchievementContainer = document.getElementById("ACV");
        if (!AchievementContainer) return;
        AchievementContainer.innerHTML = "";

        const heading = document.createElement("h2");
        heading.textContent = "Achievements";
        AchievementContainer.appendChild(heading);

        Achievements.forEach(Achievement => {
            const achievement = document.createElement("h3");
            achievement.textContent = Achievement;
            AchievementContainer.appendChild(achievement);
        });
    }

    function AchivementPopup() {
        setTimeout(function() {
            document.getElementsByClassName("achievement")[0].className = "achievement out";
            var audio = new Audio('https://centracomm.cachefly.net/majornelson/2007/Achievement-mp3-sound.mp3');
            audio.play();

            setTimeout(function() {
                document.getElementsByClassName("achievement")[0].className = "achievement";
            }, 5000);
        }, 1000);
    }

    // Goal-related functions
    function loadStoredData() {
        const savedGoal = JSON.parse(localStorage.getItem("currentGoal"));
        if (savedGoal) currentGoal = savedGoal;

        const savedWorkout = JSON.parse(localStorage.getItem("lastWorkout"));
        if (savedWorkout) lastWorkout = savedWorkout;

        if (isGoalsPage) displayGoals();
    }

    function displayGoals() {
        const goalList = document.getElementById("goalList");
        if (!goalList) return;
        goalList.innerHTML = "";

        if (currentGoal.exercise) {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `<strong>${currentGoal.exercise} for ${currentGoal.duration} minutes every day and weigh ${currentGoal.weightLoss} kg (Start: ${currentGoal.startDate})</strong> <span class="${lastWorkout.duration >= currentGoal.duration && lastWorkout.weight <= currentGoal.weightLoss ? 'star' : 'not-met'}">${lastWorkout.duration >= currentGoal.duration && lastWorkout.weight <= currentGoal.weightLoss ? '🌟' : ''}</span>`;
            goalList.appendChild(li);
        } else {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = "No goals set yet.";
            goalList.appendChild(li);
        }
    }

    function displayProgress() {
        const progressList = document.getElementById("progressList");
        if (!progressList) return;
        progressList.innerHTML = "";

        if (lastWorkout.duration > 0) {
            let timeLeft = currentGoal.duration - lastWorkout.duration;
            let weightProgress = lastWorkout.weight - currentGoal.weightLoss;
            let progressStatus = lastWorkout.duration >= currentGoal.duration ? "star" : (lastWorkout.duration > 0 ? "in-progress" : "not-met");

            progressList.innerHTML = `
                <p><strong>Time Spent: ${lastWorkout.duration} min (${timeLeft <= 0 ? "Goal reached!" : timeLeft + " min left"})</strong> <span class="${progressStatus}">💪</span></p>
                <p><strong>Your current weight is: ${lastWorkout.weight} kg (${weightProgress <= 0 ? "Goal reached!" : weightProgress + " kg to go"})</strong> <span class="${progressStatus}">💪</span></p>
            `;
        } else {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = "No recent workout data to track progress.";
            progressList.appendChild(li);
        }
    }

    // Typed.js animation (if used)
    if (document.getElementById("typed")) {
        var typed = new Typed("#typed", {
            strings: ["Track your workouts, set goals, and achieve your fitness milestones!"],
            loop: true,
            typeSpeed: 80,
            shuffle: true
        });
    }
});