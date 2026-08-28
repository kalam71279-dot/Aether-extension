const dayNames = [
  "SUN","MON","TUE","WED","THU","FRI","SAT"
];

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const backgroundImage = getComputedStyle(document.documentElement)
  .getPropertyValue("--background-image")
  .trim();

function setBackground(){
  const dashboard = document.getElementById("dashboard");
  if(backgroundImage.trim() !== ""){
    dashboard.classList.remove("no-background");
    dashboard.style.backgroundImage =
      `linear-gradient(rgba(20,25,28,.42),rgba(20,25,28,.42)),
       ${backgroundImage}`;
    dashboard.style.backgroundSize = "cover";
    dashboard.style.backgroundPosition = "center";
    dashboard.style.backgroundRepeat = "no-repeat";
  } else {
    dashboard.classList.add("no-background");
    dashboard.style.backgroundImage = "";
  }
}

function updateCalendar(){
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const head = document.getElementById("calendarHead");
  const days = document.getElementById("calendarDays");
  head.innerHTML = "";
  days.innerHTML = "";
  for(let i = 0; i < 7; i++){
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const name = document.createElement("span");
    name.textContent = dayNames[i];
    if(i === 0 || i === 6) name.classList.add("weekend");
    head.appendChild(name);
    const number = document.createElement("span");
    number.textContent = date.getDate();
    if(date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()) number.classList.add("today-number");
    if(i === 0 || i === 6) number.classList.add("weekend");
    days.appendChild(number);
  }
}

function updateDate(){
  const now = new Date();
  document.getElementById("dayName").textContent = now.toLocaleDateString("en-US", {weekday:"long"});
  document.getElementById("fullDate").textContent = `${now.getDate()} ${monthNames[now.getMonth()]}`;
}

function updateClock(){
  const now = new Date();
  const minutes = now.getMinutes() + now.getSeconds() / 60;
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  document.getElementById("clockHand").style.transform = `translateX(-50%) rotate(${minutes * 6}deg)`;
  document.getElementById("secondHand").style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;
}

function toggleFavorite(){
  const button = document.getElementById("favorite");
  button.classList.toggle("active");
  showMessage(button.classList.contains("active") ? "Added to favorites" : "Removed from favorites");
}

let notificationTimer;
function showMessage(message){
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => notification.classList.remove("show"), 1400);
}

setBackground();
updateDate();
updateCalendar();
updateClock();
setInterval(updateClock, 1000);
setInterval(() => {
  updateDate();
  updateCalendar();
}, 60000);
