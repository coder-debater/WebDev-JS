const LOGIN_URL = `https://student.sbhs.net.au/api/authorize?response_type=code&scope=all-ro&state=abc&client_id=${CLIENT_ID}&redirect_uri=http://localhost:5500/callback.html`;

const bellTemplate = document.getElementById("bell").content;
const periodTemplate = document.getElementById("period").content;

if (localStorage.getItem("Token") == null) {
    //Not logged in.
    location.href = LOGIN_URL;
}
else {
    //Logged in.
    let token = JSON.parse(localStorage.getItem("Token"));
    
    updateDailytimetable(token);

    setInterval(updateTimer, 1000);
}

async function updateDailytimetable(token) {
    let response = await fetch("https://student.sbhs.net.au/api/timetable/daytimetable.json", {
        headers: {
            "Authorization": `Bearer ${token.access_token}`
        }
    });

    if (!response.ok) {
        location.href = LOGIN_URL;
    }

    let dailyTimetable = await response.json();
    renderDailytimetable(dailyTimetable);
}

function renderDailytimetable(dailyTimetable) {
    let bellsElement = document.getElementById("bells");
    for (let child of bellsElement.children) {
        child.remove();
    }

    if (Array.isArray(dailyTimetable.roomVariations)) dailyTimetable.roomVariations = {};
    if (Array.isArray(dailyTimetable.classVariations)) dailyTimetable.classVariations = {};

    for (let bell of dailyTimetable.bells) {
        let period = dailyTimetable.timetable.timetable.periods[bell.period];
        let hasPeriod = period !== undefined && "fullTeacher" in period && "year" in period;

        let roomVariation = dailyTimetable.roomVariations[bell.period];
        let hasRoomVariation = roomVariation !== undefined;

        let classVariation = dailyTimetable.classVariations[bell.period];
        let hasClassVariation = classVariation !== undefined;

        if (hasPeriod) {
            let periodElement = periodTemplate.cloneNode(true);

            periodElement.querySelector(".name").textContent = period.title;
            periodElement.querySelector(".time").textContent = bell.time;

            let teacher = periodElement.querySelector(".teacher");
            if (hasClassVariation) {
                teacher.textContent = period.casualSurname ?? period.casual;
                teacher.classList.add("changed");
            }
            else {
                teacher.textContent = period.fullTeacher;
                teacher.classList.remove("changed");
            }

            let room = periodElement.querySelector(".room");
            if (hasRoomVariation) {
                room.textContent = roomVariation.roomTo;
                room.classList.add("changed");
            }
            else {
                room.textContent = period.room;
                room.classList.remove("changed");
            }

            bellsElement.appendChild(periodElement);
        }
        else {
            let bellElement = bellTemplate.cloneNode(true);

            bellElement.querySelector(".name").textContent = bell.bellDisplay;
            bellElement.querySelector(".time").textContent = bell.time;

            bellsElement.appendChild(bellElement);
        }
    }
}

async function refreshToken(refresh_token) {
    var response = await fetch("https://student.sbhs.net.au/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            refresh_token: refresh_token,
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    if (response.ok) {
        let token = await response.text();

        localStorage.setItem("Token", token);

        updateDailytimetable(token);
    }
    else {
        location.href = LOGIN_URL;
    }
}

function updateTimer(dailyTimetable) {

}