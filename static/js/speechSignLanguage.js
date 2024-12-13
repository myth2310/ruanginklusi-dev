
if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition Not Available");
}

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "id";
recognition.interimResults = true;

let lastProcessedText = '';
let lastCategory = '';
let lastVideoName = '';
let isSpeechActive = localStorage.getItem('isSpeechActive') === 'true';

recognition.onstart = () => {
    document.querySelector("#speechStatus").textContent = "Mulai Bicara sekarang!";
    const startButton = document.querySelector("#toggleButton");
    startButton.textContent = "Stop";
    startButton.classList.remove("btn-primary");
    startButton.classList.add("btn-danger");
};

recognition.onstop = () => {
    document.querySelector("#speechStatus").textContent = "Klik pada icon 'Start' untuk mulai berbicara";
    const startButton = document.querySelector("#toggleButton");
    startButton.textContent = "Start";
    startButton.classList.remove("btn-danger");
    startButton.classList.add("btn-primary");
};

if (isSpeechActive) {
    recognition.start();
}

recognition.onend = function () {
    console.log('Speech recognition ended.');
    setTimeout(() => {
        sendDataToFlask(lastProcessedText);
    }, 2000);
};

recognition.onerror = function (event) {
    console.error('Speech recognition error:', event.error);
    setTimeout(() => {
        sendDataToFlask(lastProcessedText);
    }, 2000);
};

recognition.onresult = function (event) {
    let textResult = '';
    for (let i = 0; i < event.results.length; i++) {
        textResult += event.results[i][0].transcript + ' ';
    }

    const cleanedText = textResult.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const spacedText = cleanedText.split(' ').join(' ');

    console.log(spacedText);
    document.querySelector("#result").innerHTML = spacedText;

    if (spacedText !== lastProcessedText && spacedText !== lastProcessedTextBefore) {
        lastProcessedTextBefore = lastProcessedText;
        lastProcessedText = spacedText;
        clearTimeout(timer);
        timer = setTimeout(() => {
            sendDataToFlask(spacedText);
        }, 2000);
    }
};

let currentVideoIndex = 0;
let videoListData = [];
let timer;
let lastProcessedTextBefore = '';

function sendDataToFlask(textResult) {
    document.getElementById('loading').style.display = 'block';

    fetch('/process_speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kata: textResult }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            document.getElementById('loading').style.display = 'none';

            const videoList = document.getElementById('videoList');
            const noVideoMessage = document.getElementById('noVideoMessage');
            const videoPlayMessage = document.getElementById('video-play');
            const resultElement = document.getElementById('result');

            currentVideoIndex = 0;
            videoListData = data.videoList;

            if (data.videoList && data.videoList.length > 0) {
                if (videoListData.length > 0) {
                    const newVideoName = videoListData[0].category;
                    videoList.src = `../static/video/${newVideoName}.mp4`;
                    videoList.style.display = 'block';
                    videoList.pause();
                    videoList.load();
                    videoList.play();
                    noVideoMessage.style.display = 'none';
                    videoPlayMessage.style.display = 'none';
                }
            } else {
                videoList.style.display = 'none';
                noVideoMessage.style.display = 'block';
                videoPlayMessage.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
        });
}

function playNextVideo() {
    const videoList = document.getElementById('videoList');
    lastProcessedTextBefore = '';
    lastProcessedText = '';
    lastCategory = '';
    lastVideoName = '';

    if (currentVideoIndex < videoListData.length - 1) {
        currentVideoIndex++;
    } else {
        videoList.pause();
        videoList.src = '';
        setTimeout(() => {
            location.reload();
        }, 2000);
        return;
    }

    const nextVideoSource = `../static/video/${videoListData[currentVideoIndex].category}.mp4`;
    videoList.src = nextVideoSource;
    videoList.load();
    videoList.play();
}

function toggleRecognition() {
    const startButton = document.querySelector("#toggleButton");
    if (startButton.textContent === "Start") {
        recognition.start();
        localStorage.setItem('isSpeechActive', 'true');
        startButton.textContent = "Stop";
        startButton.classList.remove("btn-primary");
        startButton.classList.add("btn-danger");
    } else {
        recognition.stop();
        localStorage.setItem('isSpeechActive', 'false');
        startButton.textContent = "Start";
        startButton.classList.remove("btn-danger");
        startButton.classList.add("btn-primary");
    }
}
