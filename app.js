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
        generateOutputTable(processes, algorithm);
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

function roundRobin(arrivalTimes, burstTimes, timeQuantum) {
    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;
    let queue = [];

    while (true) {
        let allProcessesCompleted = true;

        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0) {
                allProcessesCompleted = false;

                const executeTime = Math.min(timeQuantum, remainingBurstTimes[i]);
                processes.push({
                    processNumber: i + 1,
                    startTime: currentTime,
                    endTime: currentTime + executeTime,
                });
                currentTime += executeTime;
                remainingBurstTimes[i] -= executeTime;

                // If the process is not completed, add it back to the queue
                if (remainingBurstTimes[i] > 0) {
                    queue.push(i);
                }
            }
        }

        if (allProcessesCompleted) {
            break;
        }

        if (queue.length > 0) {
            const nextProcessIndex = queue.shift();
            queue.push(nextProcessIndex);
            currentTime++;
        } else {
            const minArrivalTime = Math.min(
                ...arrivalTimes.filter((at, i) => remainingBurstTimes[i] > 0)
            );
            currentTime = Math.max(currentTime, minArrivalTime);
        }
    }

    // Calculate turnaround and waiting times for each process
    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        const index = process.processNumber - 1;
        process.arrivalTime = arrivalTimes[index];
        process.burstTime = burstTimes[index];
        process.turnaroundTime = process.endTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
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
    const n = arrivalTimes.length;
    const processes = [];
    const completionTime = Array(n).fill(0);
    const remainingBurstTimes = [...burstTimes];

    let currentTime = 0;

    while (true) {
        let minBurstTime = Infinity;
        let shortestProcessIndex = -1;

        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] < minBurstTime && remainingBurstTimes[i] > 0) {
                minBurstTime = remainingBurstTimes[i];
                shortestProcessIndex = i;
            }
        }

        if (shortestProcessIndex === -1) {
            // No process can be executed, move time forward
            currentTime++;
        } else {
            // Execute the shortest remaining time process for one time unit
            processes.push({
                processNumber: shortestProcessIndex + 1,
                startTime: currentTime,
                endTime: currentTime + 1,
            });
            currentTime++;
            remainingBurstTimes[shortestProcessIndex]--;

            // Check if the process is completed
            if (remainingBurstTimes[shortestProcessIndex] === 0) {
                completionTime[shortestProcessIndex] = currentTime;
            }

            // Check if all processes are completed
            let allProcessesCompleted = true;
            for (let i = 0; i < n; i++) {
                if (remainingBurstTimes[i] > 0) {
                    allProcessesCompleted = false;
                    break;
                }
            }

            if (allProcessesCompleted) {
                break; // All processes have completed, exit the loop
            }
        }
    }

    // Generate the output table
    const outputTable = [];
    for (let i = 0; i < n; i++) {
        const turnaroundTime = completionTime[i] - arrivalTimes[i];
        const waitingTime = turnaroundTime - burstTimes[i];

        outputTable.push({
            processNumber: i + 1,
            arrivalTime: arrivalTimes[i],
            burstTime: burstTimes[i],
            startTime: processes[i].startTime,
            endTime: completionTime[i],
            turnaroundTime: turnaroundTime,
            waitingTime: waitingTime,
        });
    }

    return outputTable;
}


function hrrn(arrivalTimes, burstTimes) {
    const n = arrivalTimes.length;
    const processes = [];
    const remainingBurstTimes = [...burstTimes];
    let currentTime = 0;

    let bTimes = burstTimes;

    let maxTime = 0;
    for (let i = 0; i < bTimes.length; i++) {
        maxTime += bTimes[i];
    }

    while (currentTime < maxTime) {
        const eligibleProcesses = [];
        for (let i = 0; i < n; i++) {
            if (arrivalTimes[i] <= currentTime && remainingBurstTimes[i] > 0) {
                const waitingTime = currentTime - arrivalTimes[i];
                // Calculate Response Ratio
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
            responseRatio: selectedProcess.responseRatio, // Assign Response Ratio to the process
        });
        currentTime += executeTime;
        remainingBurstTimes[index] -= executeTime;
    }

    return processes;
}



function generateOutputTable(processes, algorithm) {
    const finalProcesses = [];
    const processMap = new Map();

    // Iterate through the processes and store the final values in processMap
    for (const process of processes) {
        processMap.set(process.processNumber, process);
    }

    // Add the values from processMap to finalProcesses
    processMap.forEach((value) => {
        finalProcesses.push(value);
    });

    // waiting time calculation
    for (let i = 0; i < processes.length; i++) {
        processes[i].waitingTime = processes[i].turnaroundTime - processes[i].burstTime;
    }

    const outputTable = document.getElementById("output-table");
    let tableHeaders = `
        <tr>
            <th>Process Number</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
        </tr>`;

    const tableRows = finalProcesses.map(process => `
        <tr>
            <td>P${process.processNumber}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.startTime}</td>
            <td>${process.endTime}</td>
            <td>${process.turnaroundTime}</td>
            <td>${process.waitingTime}</td>
        </tr>`).join("");

    outputTable.innerHTML = tableHeaders + tableRows;

    // Call the function to generate the Gantt chart
    generateGanttChart(finalProcesses);
}





function generateGanttChart(processes) {
    const ganttChartContainer = document.getElementById("gantt-chart-container");
    let ganttChartContent = '';

    processes.forEach((process) => {
        // Create Gantt chart block for each process
        const blockWidth = 5;
        ganttChartContent += `
            <div class="gantt-block" style="width: ${blockWidth * 10}px;">P${process.processNumber}</div>
        `;
    });

    ganttChartContainer.innerHTML = ganttChartContent;
}
