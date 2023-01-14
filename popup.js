const form = document.getElementById("control-row");

form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url;
  if (tab?.url) {
    try {
      url = new URL(tab.url);
      if (url.hostname !== "flexstudent.nu.edu.pk") {
        alert("Please open the FlexStudent website first.");
        return;
      }
    } catch {}
  }

  // let url = new URL("https://flexstudent.nu.edu.pk");
  const cookie = await getCookie(url.hostname);

  chrome.scripting.executeScript({ target: { tabId: tab.id }, function: doneStuff, args: [cookie] });
}

async function getCookie(domain) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 1) {
      return `${cookies[0].name}=${cookies[0].value}`;
    }
    else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function doneStuff(cookie) {
  if (!window.location.href.includes("Student/StudentMarks")) {
    alert("Please change path to Student/StudentMarks");
    return;
  }
  if (cookie === null) {
    alert("An error occured");
    return;
  }

  const getTd = (className, id) => {
    const td = document.createElement('td');
    td.classList.add("text-center");
    td.classList.add(className);
    td.id = id;
    return td;
  }

  const getTr = (id) => {
    const tr = document.createElement('tr');
    tr.classList.add("totalColumn_" + id);
    tr.appendChild(getTd("totalColGrandTotal", "GrandtotalColMarks_" + id));
    tr.appendChild(getTd("totalColObtMarks", "GrandtotalObtMarks_" + id));
    tr.appendChild(getTd("totalColAverageMark", "GrandtotalClassAvg_" + id));
    tr.appendChild(getTd("totalColMinMarks", "GrandtotalClassMin_" + id));
    tr.appendChild(getTd("totalColMaxMarks", "GrandtotalClassMax_" + id));
    tr.appendChild(getTd("totalColStdDev", "GrandtotalClassStdDev_" + id));
    return tr;
  }

  async function ftn_calculateMarks(id, cookie) {
    var temp = "totalColumn_" + id;
    var tempGrandTotal = 0;

    document.querySelectorAll('.sum_table').forEach((t) => {
      t.querySelectorAll(`.${temp}`).forEach((e) => {
        e.querySelectorAll('.totalColweightage').forEach((m) => {
          if (m.textContent != "") {
            tempGrandTotal += parseFloat(m.textContent);
          }
        });
        if ((!isNaN(tempGrandTotal) && tempGrandTotal != 0)) {
          document.getElementById(`GrandtotalColMarks_${id}`).textContent = tempGrandTotal.toFixed(2);
        }
      });
    });

    var sem = document.getElementById("SemId");
    var SemID = sem.options[sem.selectedIndex].value;

    let headersList = {
      "Accept": "*/*",
      "User-Agent": navigator.userAgent,
      "Cookie": cookie,
      "Content-Type": "application/json"
    }

    let bodyContent = JSON.stringify({
      "CourseId": id,
      "SemID": SemID
    });

    let response = await fetch("https://flexstudent.nu.edu.pk/Student/GetClassAvg", {
      method: "POST",
      body: bodyContent,
      headers: headersList
    });

    let data = await response.json();
    for (var i = 0; i < data.length; i++) {
      document.getElementById(`GrandtotalClassAvg_${id}`).textContent = data[i].CLASS_AVG.toFixed(2);
      document.getElementById(`GrandtotalClassMax_${id}`).textContent = data[i].CLASS_MAX.toFixed(2);
      document.getElementById(`GrandtotalClassMin_${id}`).textContent = data[i].CLASS_MIN.toFixed(2);
      document.getElementById(`GrandtotalClassStdDev_${id}`).textContent = data[i].CLASS_STD.toFixed(2);
      document.getElementById(`GrandtotalObtMarks_${id}`).textContent = data[i].TOT_WEIGHT.toFixed(2);
    }
  }

  const courses = document.querySelectorAll(`div[class*='tab-pane']`); // Get all courses
  const buttons = document.querySelectorAll(`button[onclick*="ftn_calculateMarks"]`); // Get all buttons containing courses

  for (let i = 0; i < buttons.length; i++) {
    const courseId = courses[i].id;
    const id = parseInt(buttons[i].getAttribute('onclick').substring(20, 24));
    const newTr = getTr(id);
    courses[i].querySelector(`div[id=${courseId}-Grand_Total_Marks]`).querySelector('tbody').appendChild(newTr);
    // document.querySelectorAll(`div[class*='tab-pane']`)[i].querySelector(`div[id=${courseId}-Grand_Total_Marks]`).querySelector('tbody').appendChild(newTr);

    await ftn_calculateMarks(id, cookie);
  }
}

