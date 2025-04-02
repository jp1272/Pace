"use strict";
const button = document.querySelector(".first");
const addWorkout = document.querySelector(".add-workout");
const addWorkout2 = document.querySelector(".add-workout2");
const modalForm = document.getElementById("event-modal");
const overlay = document.querySelector(".overlay");
const form = document.getElementById("event-form");
const btnCloseModal = document.querySelector(".btn--close-modal");
const eventDateInput = document.getElementById("event-date");
const workoutType = document.getElementById("event-type");
const workoutTitle = document.getElementById("event-title");
const workoutDistance = document.getElementById("event-distance");
const workoutDurationHours = document.getElementById("hours");
const workoutDurationMins = document.getElementById("minutes");
const workoutDurationSecs = document.getElementById("seconds");
const workoutNotes = document.getElementById("event-description");

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

class Log {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.workouts = JSON.parse(localStorage.getItem("workouts")) || {};

    addWorkout.addEventListener("click", () => this.openModal());
    addWorkout2.addEventListener("click", () => this.openModal());
    btnCloseModal.addEventListener("click", () => this.closeModal());
    form.addEventListener("submit", (e) => this.addWorkout(e));

    this.renderWorkout();
  }

  renderWorkout() {
    for (let i = 0; i < 31; i++) {
      const dateKey = this.getDateKey(i);
      if (this.workouts[dateKey]) {
        console.log(this.workouts[dateKey]);
        this.workouts[dateKey].forEach((workout) => {
          console.log(workout);
          let html = `
            <li data-id="${workout.id}">
              <div class="workout-div">
                <h2 class="title">${workout.title}</h2>
                <p class="workout-type">${workout.type}:  ${workout.date}</p>
                <p class="stats">${workout.distance} miles in ${workout.duration} (${workout.pace} pace)</p>
                <p class="workout-notes">
                  Notes: ${workout.description}
                </p>
              </div>
            </li>`;
          button.insertAdjacentHTML("afterend", html);
        });
      }
    }
  }

  getDateKey(day) {
    return `${this.currentYear}-${this.currentMonth < 10 ? "0" : ""}${
      this.currentMonth + 1
    }-${day < 10 ? "0" : ""}${day}`;
  }

  openModal(event, buttonClick = true) {
    if (buttonClick) {
      eventDateInput.value = new Date().toISOString().split("T")[0];
    }
    modalForm.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  closeModal() {
    modalForm.classList.add("hidden");
    overlay.classList.add("hidden");
    form.reset();
  }

  addWorkout(event) {
    event.preventDefault();
    const date = eventDateInput.value;
    const type = workoutType.value;
    const distance = parseFloat(workoutDistance.value) || 0;
    const duration = `
      ${workoutDurationHours.value || 0}:${
      workoutDurationMins.value < 10 ? "0" : ""
    }${workoutDurationMins.value || 0}:${
      workoutDurationSecs.value < 10 ? "0" : ""
    }${workoutDurationSecs.value || 0}`;
    const title = workoutTitle.value;
    const description = workoutNotes.value;

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
    location.reload();
  }
}

const log = new Log();
