let model;

async function createModel() {
    model = tf.sequential();
    model.add(tf.layers.dense({units: 10, inputShape: [10], activation: 'relu'}));
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));
    model.compile({optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy']});
}

async function trainModel(data) {
    const xs = tf.tensor2d(data.map(item => item.input));
    const ys = tf.tensor2d(data.map(item => item.output));
    await model.fit(xs, ys, {epochs: 10});
}

async function predict(data) {
    const xs = tf.tensor2d([data]);
    const prediction = model.predict(xs);
    return prediction.dataSync()[0];
}

function checkKey() {
    let enteredKey = document.getElementById("keyInput").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let isValid = users.some(user => user.key === enteredKey);

    if (isValid) {
        localStorage.setItem("isLoggedIn", "true");
        showHomePage();
    } else {
        document.getElementById("message").innerText = "Invalid Key!";
    }
}

function showHomePage() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("homeBox").style.display = "block";
}

function logout() {
    localStorage.removeItem("isLoggedIn");
    location.reload();
}

if (localStorage.getItem("isLoggedIn") === "true") {
    showHomePage();
}

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#dataTable tbody');
    const predictedNumberElement = document.getElementById('predictedNumber');
    const currentPeriodElement = document.getElementById('currentPeriod');
    const winCountElement = document.getElementById('winCount');
    const lossCountElement = document.getElementById('lossCount');

    const winSound = new Audio('win-sound.mp3');
    const lossSound = new Audio('loss-sound.mp3');

    let winCount = 0;
    let lossCount = 0;

    const fetchData = async (url, body) => {
        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getGameData = async () => {
        let data = await fetchData('https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList', {
            pageSize: 10, pageNo: 1, typeId: 1, language: 0,
            random: "ded40537a2ce416e96c00e5218f6859a",
            signature: "69306982EEEB19FA940D72EC93C62552",
            timestamp: Math.floor(Date.now() / 1000)
        });

        if (data && data.data && data.data.list) {
            return data.data.list.map(item => ({ issue: item.issueNumber, number: Number(item.number) }));
        }
        return [];
    };

    const categorizeNumber = (number) => (number >= 0 && number <= 4) ? "Small" : "Big";

    const trendAnalysisPrediction = (data) => {
        if (data.length < 3) return "No Data";

        const recentData = data.slice(0, 3);
        let bigCount = recentData.filter(item => item.number > 4).length;
        let smallCount = recentData.filter(item => item.number <= 4).length;

        return bigCount > smallCount ? "Big" : "Small";
    };

    const updateDataAndPrediction = async () => {
        let gameData = await getGameData();
        if (gameData.length > 0) {
            tableBody.innerHTML = '';
            gameData.forEach(item => {
                tableBody.innerHTML += `<tr><td>${item.issue}</td><td>${categorizeNumber(item.number)}</td></tr>`;
            });

            let prediction = trendAnalysisPrediction(gameData);
            predictedNumberElement.textContent = `🔮 Prediction: ${prediction}`;

            let currentIssueNumber = gameData[0].issue;
            let nextPeriod = (BigInt(currentIssueNumber) + 1n).toString();
            currentPeriodElement.textContent = `📅 Period: ${nextPeriod}`;

            checkWinLoss(prediction, categorizeNumber(gameData[0].number));
        }
    };

    const checkWinLoss = (prediction, actual) => {
        let popupWin = document.getElementById('popupWin');
        let popupLoss = document.getElementById('popupLoss');

        if (prediction === actual) {
            winCount++;
            popupWin.style.display = 'block';
            winSound.play();
            setTimeout(() => { popupWin.style.display = 'none'; }, 3000);
        } else {
            lossCount++;
            popupLoss.style.display = 'block';
            lossSound.play();
            setTimeout(() => { popupLoss.style.display = 'none'; }, 3000);
        }

        winCountElement.textContent = winCount;
        lossCountElement.textContent = lossCount;
    };

    function startReverseTimer() {
        function updateTimer() {
            let now = new Date();
            if (now.getSeconds() === 0) updateDataAndPrediction();
        }

        setInterval(updateTimer, 1000);
        updateTimer();
    }

    createModel().then(() => {
        updateDataAndPrediction();
        startReverseTimer();
    });
});
