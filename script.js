// script.js
async function startCourse() {
  try {
    const response = await fetch("tasks.json");
    const courses = await response.json();
    
    // Redirect to Course 1 page
    window.location.href = "page1.html";
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}
