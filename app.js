document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("scheduling-form");
    const outputTable = document.getElementById("output-table");
    const timeQuantumGroup = document.getElementById("time-quantum-group");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Get user input values
        const algorithm = document.getElementById("algorithm").value;
        const arrivalTimes = document.getElementById("arrival-times").value.split(" ").map(Number);
        const burstTimes = document.getElementById("burst-times").value.split(" ").map(Number);
        const timeQuantum = parseInt(document.getElementById("time-quantum").value, 10);

        // Validate input
        if (arrivalTimes.length !== burstTimes.length) {
            alert("Number of arrival times must match the number of burst times.");
            console.log("Number of Arrival Times:" + arrivalTimes.length + "\nNumber of Burst Times:" + burstTimes.length);
            return;
        }

        if (algorithm === "Round Robin" && isNaN(timeQuantum)) {
            alert("Please enter a valid time quantum.");
            return;
        }

        // Calculate scheduling results based on the selected algorithm
        let processes = [];

        switch (algorithm) {
            case "Round Robin":
                processes = roundRobin(arrivalTimes, burstTimes, timeQuantum);
                break;
            case "FCFS":
                processes = fcfs(arrivalTimes, burstTimes);
                break;
            case "SJF":
                processes = sjf(arrivalTimes, burstTimes);
                break;
            case "SRT":
                processes = srt(arrivalTimes, burstTimes);
                break;
            case "HRRN":
                processes = hrrn(arrivalTimes, burstTimes);
                break;
            default:
                alert("Invalid algorithm selection.");
                return;
        }

        // Generate the output table
        generateOutputTable(processes);
    });

    // Show or hide the time quantum input field based on the selected algorithm
    const algorithmSelect = document.getElementById("algorithm");
    algorithmSelect.addEventListener("change", function () {
        const selectedAlgorithm = algorithmSelect.value;
        if (selectedAlgorithm === "Round Robin") {
            timeQuantumGroup.style.display = "block";
        } else {
            timeQuantumGroup.style.display = "none";
        }
    });
});

function roundRobin(arrivalTimes, burstTimes) {
    const timeQuantum = 2; // You can adjust the time quantum as needed
    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;

    while (remainingBurstTimes.some((bt) => bt > 0)) {
        for (let i = 0; i < n; i++) {
            if (remainingBurstTimes[i] > 0) {
                const executeTime = Math.min(remainingBurstTimes[i], timeQuantum);
                processes.push({
                    processNumber: i + 1,
                    arrivalTime: arrivalTimes[i],
                    burstTime: burstTimes[i],
                    startTime: currentTime,
                    endTime: currentTime + executeTime,
                    turnaroundTime: currentTime + executeTime - arrivalTimes[i],
                    waitingTime: currentTime - arrivalTimes[i],
                });
                currentTime += executeTime;
                remainingBurstTimes[i] -= executeTime;
            }
        }
    }

    return processes;
}


function fcfs(arrivalTimes, burstTimes) {
    const n = arrivalTimes.length;
    const processes = [];
    let currentTime = 0;

    for (let i = 0; i < n; i++) {
        processes.push({
            processNumber: i + 1,
            arrivalTime: arrivalTimes[i],
            burstTime: burstTimes[i],
            startTime: currentTime,
            endTime: currentTime + burstTimes[i],
            turnaroundTime: currentTime + burstTimes[i] - arrivalTimes[i],
            waitingTime: currentTime - arrivalTimes[i],
        });
        currentTime += burstTimes[i];
    }

    return processes;
}


function sjf(arrivalTimes, burstTimes) {
    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;

    while (processes.length < n) {
        const eligibleProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0) {
                eligibleProcesses.push({
                    processNumber: i + 1,
                    arrivalTime: arrivalTimes[i],
                    burstTime: remainingBurstTimes[i],
                });
            }
        }
        eligibleProcesses.sort((a, b) => a.burstTime - b.burstTime);

        if (eligibleProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const selectedProcess = eligibleProcesses[0];
        const index = selectedProcess.processNumber - 1;
        processes.push({
            processNumber: selectedProcess.processNumber,
            arrivalTime: selectedProcess.arrivalTime,
            burstTime: burstTimes[index],
            startTime: currentTime,
            endTime: currentTime + burstTimes[index],
            turnaroundTime: currentTime + burstTimes[index] - selectedProcess.arrivalTime,
            waitingTime: currentTime - selectedProcess.arrivalTime,
        });
        currentTime += burstTimes[index];
        remainingBurstTimes[index] = 0;
    }

    return processes;
}


function srt(arrivalTimes, burstTimes) {
    // Implementing SRT is more complex and may require a preemptive approach.
    // You can use a priority queue or a timer-based approach to simulate it.
    // The provided code is a simplified example and may not cover all cases.

    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;

    while (processes.length < n) {
        const eligibleProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0) {
                eligibleProcesses.push({
                    processNumber: i + 1,
                    arrivalTime: arrivalTimes[i],
                    burstTime: remainingBurstTimes[i],
                });
            }
        }
        eligibleProcesses.sort((a, b) => a.burstTime - b.burstTime);

        if (eligibleProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const selectedProcess = eligibleProcesses[0];
        const index = selectedProcess.processNumber - 1;
        const executeTime = 1; // SRT typically involves preemptive execution
        processes.push({
            processNumber: selectedProcess.processNumber,
            arrivalTime: selectedProcess.arrivalTime,
            burstTime: burstTimes[index],
            startTime: currentTime,
            endTime: currentTime + executeTime,
            turnaroundTime: currentTime + executeTime - selectedProcess.arrivalTime,
            waitingTime: currentTime - selectedProcess.arrivalTime,
        });
        currentTime += executeTime;
        remainingBurstTimes[index] -= executeTime;
    }

    return processes;
}


function hrrn(arrivalTimes, burstTimes) {
    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;

    while (processes.length < n) {
        const eligibleProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0) {
                const waitingTime = currentTime - arrivalTimes[i];
                const responseRatio = (waitingTime + remainingBurstTimes[i]) / remainingBurstTimes[i];
                eligibleProcesses.push({
                    processNumber: i + 1,
                    arrivalTime: arrivalTimes[i],
                    burstTime: remainingBurstTimes[i],
                    responseRatio: responseRatio,
                });
            }
        }
        eligibleProcesses.sort((a, b) => b.responseRatio - a.responseRatio);

        if (eligibleProcesses.length === 0) {
            currentTime++;
            continue;
        }

        const selectedProcess = eligibleProcesses[0];
        const index = selectedProcess.processNumber - 1;
        const executeTime = 1; // HRRN typically involves preemptive execution
        processes.push({
            processNumber: selectedProcess.processNumber,
            arrivalTime: selectedProcess.arrivalTime,
            burstTime: burstTimes[index],
            startTime: currentTime,
            endTime: currentTime + executeTime,
            turnaroundTime: currentTime + executeTime - selectedProcess.arrivalTime,
            waitingTime: currentTime - selectedProcess.arrivalTime,
        });
        currentTime += executeTime;
        remainingBurstTimes[index] -= executeTime;
    }

    return processes;
}


function generateOutputTable(processes) {
    const outputTable = document.getElementById("output-table");
    const tableHeaders = `
        <tr>
            <th>Process Number</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
        </tr>
    `;

    const tableRows = processes
        .map(
            (process) => `
                <tr>
                    <td>P${process.processNumber}</td>
                    <td>${process.arrivalTime}</td>
                    <td>${process.burstTime}</td>
                    <td>${process.startTime}</td>
                    <td>${process.endTime}</td>
                    <td>${process.turnaroundTime}</td>
                    <td>${process.waitingTime}</td>
                </tr>
            `
        )
        .join("");

    outputTable.innerHTML = tableHeaders + tableRows;
}