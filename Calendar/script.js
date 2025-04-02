"use strict";

function extractNumbers(str) {
  let numArray = str
    .split(":")
    .filter((word) => !isNaN(word))
    .filter((num) => num)
    .map(Number);

  let durationInSecs = numArray[0] * 3600 + numArray[1] * 60 + numArray[2];
  return durationInSecs;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

class Workout {
  constructor(type, distance, duration, date, title, desciption) {
    this.type = type;
    this.distance = distance;
    this.duration = duration;
    this.date = date;
    this.title = title;
    this.description = desciption;
    this.id = Date.now().toString();
    this.calcPace();
  }

  calcPace() {
    // min per mile
    this.pace = extractNumbers(this.duration) / this.distance;
    // this.pace = this.duration / this.distance;
    // this.pace = `${Math.floor(this.pace / 60)}:${
    //   this.pace % 60 < 10 ? "0" : ""
    // }${this.pace % 60}`;
    this.pace = `${Math.floor(this.pace / 60)}:${
      this.pace % 60 < 10 ? "0" : ""
    }${Math.floor(this.pace % 60)}`;
    return this.pace;
  }
}

class App {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.workouts = JSON.parse(localStorage.getItem("workouts")) || {};

    this.calendarDates = document.querySelector(".dates");
    this.monthYear = document.querySelector(".month-year");
    this.prevMonthButton = document.querySelector(".prev-month");
    this.nextMonthButton = document.querySelector(".next-month");
    this.modalForm = document.getElementById("event-modal");
    this.overlay = document.querySelector(".overlay");
    this.btnCloseModal = document.querySelector(".btn--close-modal");
    this.closeWorkout = document.querySelector(".close-workout-modal");
    this.btnShowModal = document.querySelector(".log__btn");
    this.eventDateInput = document.getElementById("event-date");
    this.workoutType = document.getElementById("event-type");
    this.workoutTitle = document.getElementById("event-title");
    this.workoutDistance = document.getElementById("event-distance");
    this.workoutDurationHours = document.getElementById("hours");
    this.workoutDurationMins = document.getElementById("minutes");
    this.workoutDurationSecs = document.getElementById("seconds");
    this.workoutNotes = document.getElementById("event-description");
    this.form = document.getElementById("event-form");
    this.savedWorkout = document.querySelector(".workout-entry");
    this.workoutModal = document.querySelector(".workout-modal");

    this.prevMonthButton.addEventListener("click", () => this.changeMonth(-1));
    this.nextMonthButton.addEventListener("click", () => this.changeMonth(1));
    this.calendarDates.addEventListener("dblclick", (e) => this.openModal(e));
    this.btnShowModal.addEventListener("click", (e) => this.openModal(e, true));
    this.btnCloseModal.addEventListener("click", () => this.closeModal());
    this.closeWorkout.addEventListener("click", () => this.closeWorkoutModal());
    this.overlay.addEventListener("click", () => this.closeModal());
    this.form.addEventListener("submit", (e) => this.addWorkout(e));

    this.renderCalendar();
    // Get data from local storage
    // Attach event handlers
  }

  renderCalendar() {
    this.calendarDates.innerHTML = "";
    this.monthYear.textContent = `${this.getMonthName()} ${this.currentYear}`;

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    for (let i = 0; i < firstDay; i++) {
      this.calendarDates.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      let dayCell = document.createElement("div");
      dayCell.textContent = day;
      dayCell.setAttribute("data-date", this.getDateKey(day));
      dayCell.classList.add("date");

      const dateKey = this.getDateKey(day);
      if (this.workouts[dateKey]) {
        this.workouts[dateKey].forEach((workout) => {
          let workoutElement = document.createElement("div");
          workoutElement.textContent = `${workout.distance} mile ${workout.type}`;
          workoutElement.classList.add("workout-entry");
          dayCell.appendChild(workoutElement);

          // Add event listener after creating the element
          workoutElement.addEventListener("click", () =>
            this.showWorkout(workout, day)
          );
          this.btnCloseModal.addEventListener("click", () =>
            this.closeModal(this.workoutModal)
          );
        });
      }

      this.calendarDates.appendChild(dayCell);
    }
  }

  getMonthName() {
    return new Date(this.currentYear, this.currentMonth).toLocaleString(
      "default",
      { month: "long" }
    );
  }

  getDateKey(day) {
    return `${this.currentYear}-${this.currentMonth < 10 ? "0" : ""}${
      this.currentMonth + 1
    }-${day < 10 ? "0" : ""}${day}`;
  }

  changeMonth(step) {
    this.currentMonth += step;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }

  openModal(event, buttonClick = false) {
    if (buttonClick || event.target.dataset.date) {
      if (buttonClick) {
        this.eventDateInput.value = new Date().toISOString().split("T")[0];
      } else if (event.target.dataset.date) {
        let selectedDate = event.target.dataset.date.split("-");
        let formattedDate = `${selectedDate[0]}-${selectedDate[1].padStart(
          2,
          "0"
        )}-${selectedDate[2].padStart(2, "0")}`;
        this.eventDateInput.value = formattedDate;
      }
      this.modalForm.classList.remove("hidden");
      this.overlay.classList.remove("hidden");
    }
  }

  closeModal() {
    this.modalForm.classList.add("hidden");
    this.overlay.classList.add("hidden");
    this.form.reset();
  }

  closeWorkoutModal() {
    this.workoutModal.classList.add("hidden");
    this.overlay.classList.add("hidden");
    this.form.reset();
  }

  addWorkout(event) {
    event.preventDefault();
    const date = this.eventDateInput.value;
    const type = this.workoutType.value;
    const distance = parseFloat(this.workoutDistance.value) || 0;
    const duration = `
      ${this.workoutDurationHours.value || 0}:${
      this.workoutDurationMins.value < 10 ? "0" : ""
    }${this.workoutDurationMins.value || 0}:${
      this.workoutDurationSecs.value < 10 ? "0" : ""
    }${this.workoutDurationSecs.value || 0}`;
    const title = this.workoutTitle.value;
    const description = this.workoutNotes.value;

    if (!type || distance <= 0 || duration <= 0) {
      alert("Please enter valid workout details.");
      return;
    }

    if (!this.workouts[date]) {
      this.workouts[date] = [];
    }
    this.workouts[date].push(
      new Workout(type, distance, duration, date, title, description)
    );
    localStorage.setItem("workouts", JSON.stringify(this.workouts));

    this.closeModal();
    this.renderCalendar();
  }

  showWorkout(wo, day) {
    this.workoutModal.classList.remove("hidden");
    this.overlay.classList.remove("hidden");

    document.getElementById("workout-title").textContent = `${
      months[this.currentMonth]
    } ${day}: ${wo.title}`;

    document.getElementById(
      "workout-summary"
    ).textContent = `${wo.distance} mile ${wo.type} in ${wo.duration} (${wo.pace} pace) `;

    document.getElementById(
      "workout-description"
    ).textContent = `Notes: ${wo.description}`;
  }
}

const app = new App();

// document.addEventListener("DOMContentLoaded", () => new App());

//   _renderCalendar(month, year) {
//     calendarDates.innerHTML = "";
//     monthYear.textContent = `${months[month]} ${year}`;

//     // get first day of month
//     const firstDay = new Date(year, month, 1).getDay();

//     // get number of days in given month
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     // Get today's date
//     const today = new Date();

//     for (let i = 0; i < firstDay; i++) {
//       const blank = document.createElement("div");
//       calendarDates.appendChild(blank);
//     }

//     for (let i = 1; i <= daysInMonth; i++) {
//       const day = document.createElement("div");
//       day.textContent = i;

//       if (
//         i === today.getDate() &&
//         year === today.getFullYear() &&
//         month === today.getMonth()
//       ) {
//         day.classList.add("today-date");
//       }
//       calendarDates.appendChild(day);
//     }
//   }

//   _convertDate(str) {
//     return str
//       .split("-")
//       .map((s) => (s < 10 ? `0${s}` : s))
//       .join("-");
//   }

//   _openModal(e) {
//     e.preventDefault();
//     modalForm.classList.remove("hidden");
//     overlay.classList.remove("hidden");
//   }

//   _closeModal() {
//     workoutDistance.value =
//       workoutDurationHours =
//       workoutDurationMins =
//       workoutDurationSecs =
//         "";

//     modalForm.classList.add("hidden");
//     overlay.classList.add("hidden");
//   }

//   _newWorkout(e) {
//     const validInputs = (...inputs) =>
//       inputs.every((inp) => Number.isFinite(inp));

//     const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

//     e.preventDefault();

//     // Get data from the form
//     const type = workoutType.value;
//     const distance = +workoutDistance.value;
//     const durationHours = +workoutDurationHours.value;
//     const durationMins = +workoutDurationMins.value;
//     const durationSecs = +workoutDurationSecs.value;
//     let workout;

//     // If running create running object
//     if (type === "run") {
//       // Check if data is valid
//       if (
//         // !Number.isFinite(distance) ||
//         // !Number.isFinite(duration) ||
//         // !Number.isFinite(cadence)
//         !validInputs(distance, duration) ||
//         !allPositive(distance, duration)
//       )
//         return alert("Inputs have to be positive numbers!");

//       workout = new Running(distance, duration);
//     }

//     // If cycling create cycling object
//     if (type === "bike") {
//       // Check if data is valid
//       if (!validInputs(distance, duration) || !allPositive(distance, duration))
//         return alert("Inputs have to be positive numbers!");

//       workout = new Cycling(distance, duration);
//     }

//     // Add new object to workout array
//     this.#workouts.push(workout);

//     // Render workout on calendar as marker

//     // Hide form + clear input fields + Clear input fields
//     this._closeModal();

//     // set local storage to all workouts
//   }

//   _setLocalStorage() {
//     localStorage.setItem("workouts", JSON.stringify(this.#workouts));
//   }
// }

// const app = new App();

// prevMonthButton.addEventListener("click", () => {
//   currentMonth--;
//   if (currentMonth < 0) {
//     currentMonth = 11;
//     currentYear--;
//   }
//   renderCalendar(currentMonth, currentYear);
// });

// nextMonthButton.addEventListener("click", () => {
//   currentMonth++;
//   if (currentMonth > 11) {
//     currentMonth = 0;
//     currentYear++;
//   }
//   renderCalendar(currentMonth, currentYear);
// });

// calendarDates.addEventListener("dblclick", (e) => {
//   if (e.target.textContent !== "") {
//     eventDateInput.value = convertDate(
//       `${currentYear}-${currentMonth + 1}-${e.target.textContent}`
//     );
//     openModal(e);
//   }
// });

// btnShowModal.addEventListener("click", (e) => {
//   eventDateInput.value = eventDateInput.value = convertDate(
//     `${currentYear}-${currentMonth + 1}-${currentDay}`
//   );
//   openModal(e);
// });
// btnCloseModal.addEventListener("click", _closeModal);
// overlay.addEventListener("click", _closeModal);

// // Add workout to workout array

// // Render workout marker on date of activity

// // Render workout on Running Log
