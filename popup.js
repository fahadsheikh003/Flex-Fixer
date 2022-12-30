const form = document.getElementById("control-row");

form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  let url = new URL("https://flexstudent.nu.edu.pk");
  const cookie = await getCookie(url.hostname);
  // alert(cookie);
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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

    // $('.sum_table').each(function (t) {
    //     $(this).find("." + temp).each(function () {
    //         $(this).find(".totalColweightage").each(function () {
    //             if ($(this).text() != "") {
    //                 tempGrandTotal += parseFloat($(this).text());
    //             }
    //         });
    //         if ((!isNaN(tempGrandTotal) && tempGrandTotal != 0)) {
    //             $("#GrandtotalColMarks_" + id).html(tempGrandTotal.toFixed(2));
    //         }
    //     });
    // });

    var sem = document.getElementById("SemId");
    var SemID = sem.options[sem.selectedIndex].value;

    // $.ajax
    //     ({
    //         type: "POST",
    //         url: "https://flexstudent.nu.edu.pk/Student/GetClassAvg",
    //         headers: {
    //             Accept: "*/*",
    //             "User-Agent": navigator.userAgent,
    //             Cookie: cookie
    //         },
    //         data: {
    //             CourseId: id,
    //             SemID: SemID
    //         },
    //         success: function (data) {
    //             for (var i = 0; i < data.length; i++) {
    //                 $("#GrandtotalClassAvg_" + id).html(data[i].CLASS_AVG.toFixed(2));
    //                 $("#GrandtotalClassMax_" + id).html(data[i].CLASS_MAX.toFixed(2));
    //                 $("#GrandtotalClassMin_" + id).html(data[i].CLASS_MIN.toFixed(2));
    //                 $("#GrandtotalClassStdDev_" + id).html(data[i].CLASS_STD.toFixed(2));
    //                 $("#GrandtotalObtMarks_" + id).html(data[i].TOT_WEIGHT.toFixed(2));
    //             }

    //         },
    //         error: function (e) {

    //         }
    //     });

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

