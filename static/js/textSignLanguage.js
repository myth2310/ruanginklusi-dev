let currentVideoIndex = 0;
let videoListData = [];

function searchVideo() {
    const inputText = document.getElementById('textInput').value;
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';

    fetch('/process_input', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'input_text': inputText }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('resultText').innerText = data.result;

            if (data.videoList.length > 0) {
                currentVideoIndex = 0;
                videoListData = data.videoList;

                playNextVideo();
                document.getElementById('vidioList').style.display = 'block';
                document.getElementById('noVideoMessage').style.display = 'none';
            } else {
                document.getElementById('vidioList').style.display = 'none';
                document.getElementById('noVideoMessage').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
}

function playNextVideo() {
    const videoContainer = document.getElementById('videoContainer');

    if (currentVideoIndex < videoListData.length) {
        const video = document.createElement('video');
        video.setAttribute('width', '100%');
        video.setAttribute('height', '100%');
        video.setAttribute('controls', 'controls');
        video.setAttribute('autoplay', 'autoplay');

        const source = document.createElement('source');
        const videoName = videoListData[currentVideoIndex].category;

        if (videoName) {
            source.setAttribute('src', `/static/video/${videoName}.mp4`);
            source.setAttribute('type', 'video/mp4');

            video.appendChild(source);
            videoContainer.innerHTML = '';
            videoContainer.appendChild(video);

            currentVideoIndex++;

            video.addEventListener('ended', function () {
                if (currentVideoIndex < videoListData.length) {
                    playNextVideo();
                } else {
                    video.pause();
                    video.currentTime = 0;
                    videoContainer.innerHTML = '';
                    document.getElementById('vidioList').style.display = 'none';
                    document.getElementById('noVideoMessage').style.display = 'block';
                }
            });

            video.play();
        } else {
            document.getElementById('vidioList').style.display = 'none';
            document.getElementById('noVideoMessage').style.display = 'block';
        }
    }
}

function clearData() {
    document.getElementById('resultText').innerText = '';
    document.getElementById('videoContainer').innerHTML = '';
    document.getElementById('vidioList').style.display = 'none';
    document.getElementById('noVideoMessage').style.display = 'none';
}
