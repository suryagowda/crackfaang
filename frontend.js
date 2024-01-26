document.addEventListener('DOMContentLoaded', async () => {
    const mainPage = document.getElementById('main-page');
    const questionsPage = document.getElementById('questions-page');
    const topicDropdown = document.getElementById('topic-dropdown');
    const topicTitle = document.getElementById('topic-title');
    const questionsTableBody = document.getElementById('questions-body');

    // Fetch available topics from the API endpoint
    const topicsResponse = await fetch('https://uncovered-harmonious-faucet.glitch.me/api/topics');
    const topicsData = await topicsResponse.json();

    // Populate the topic dropdown with available topics
    topicsData.topics.forEach((topic) => {
        const option = document.createElement('option');
        option.value = topic;
        option.text = topic;
        topicDropdown.add(option);
    });

    // Function to go back to the main page
    window.goToMainPage = () => {
        mainPage.style.display = 'block';
        questionsPage.style.display = 'none';
    };

    // Function to start solving questions for the selected topic
    window.startSolving = async () => {
        const selectedTopic = topicDropdown.value;

        mainPage.style.display = 'none';
        questionsPage.style.display = 'block';

        // Set the title for the questions page
        topicTitle.innerText = `Questions for ${selectedTopic}`;

        // Send a POST request to the backend to get questions for the selected topic
        const response = await fetch('https://uncovered-harmonious-faucet.glitch.me/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: selectedTopic }),
        });

        if (response.ok) {
            const questions = await response.json();

            // Retrieve completion status from local storage for the selected topic
            const completedStatusKey = `completedStatus_${selectedTopic}`;
            const completedStatus = JSON.parse(localStorage.getItem(completedStatusKey)) || {};

            // Display questions in a table with numbering and completion status
            questionsTableBody.innerHTML = '';
            questions.forEach((question, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${question.Problem}</td>
                    <td><a href="${question.URL}" target="_blank"><img src="https://i.ibb.co/RcQ5qLs/Coding-Ninjas-logo.jpg" alt="Logo" style="width: 20px; height: 20px;"></a></td>
                    <td><a href="${question.URL2}" target="_blank"><img src="https://img.icons8.com/color/24/000000/GeeksforGeeks.png" alt="Logo"></a></td>
                    <td>
                        <input type="checkbox" id="completion-${index}" 
                            ${completedStatus[index] ? 'checked' : ''} 
                            onchange="updateCompletionStatus(${index}, '${selectedTopic}')">
                    </td>
                `;
                questionsTableBody.appendChild(row);
            });

            // Calculate and update the water level based on the completion percentage
            const totalQuestions = questions.length;
            const completedQuestions = Object.values(completedStatus).filter(status => status).length;
            const completionPercentage = (completedQuestions / totalQuestions) * 100;

            const waterLevel = document.getElementById('water-level');
            waterLevel.style.height = `${completionPercentage}%`;
        } else {
            console.error('Error fetching questions:', response.statusText);
        }
    };

    // Function to update completion status in local storage
    window.updateCompletionStatus = (index, selectedTopic) => {
        const completionCheckbox = document.getElementById(`completion-${index}`);
        const completedStatusKey = `completedStatus_${selectedTopic}`;
        const completedStatus = JSON.parse(localStorage.getItem(completedStatusKey)) || {};
        completedStatus[index] = completionCheckbox.checked;
        localStorage.setItem(completedStatusKey, JSON.stringify(completedStatus));

        // Refresh the page to update progress after a completion status change
        window.startSolving();
    };

    // Function to go back to the main page
    window.goToMainPage = () => {
        mainPage.style.display = 'block';
        questionsPage.style.display = 'none';

        // Reset the water level when going back to the main page
        const waterLevel = document.getElementById('water-level');
        waterLevel.style.height = '0%';
    };
});
