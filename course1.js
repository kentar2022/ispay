// course1.js
document.addEventListener("DOMContentLoaded", function() {
    startCourse();
});

let currentCourseIndex = 0;
let currentTaskIndex = 0;
let score = 0;

async function startCourse() {
    try {
        const response = await fetch("tasks.json");
        const courses = await response.json();

        if (courses && courses.length > 0) {
            sessionStorage.setItem('courses', JSON.stringify(courses));
            executeCourse();
        } else {
            console.error("No valid courses found.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

function executeCourse() {
    const courses = JSON.parse(sessionStorage.getItem('courses'));

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
        console.error("No valid courses found in sessionStorage.");
        return;
    }


    console.log(courses[currentCourseIndex]);
}
