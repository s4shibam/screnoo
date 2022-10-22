// Screnoo - JS File
import './style.css'

// All variable Declarations
let stream = null,
  audio = null,
  mixedStream = null,
  dataChunks = [],
  recorder = null,
  startButton = null,
  stopButton = null,
  blobUrl = null,
  downloadButton = null,
  recordedVideo = null,
  homeButton = null,
  logoButton = null;

// Setting up Recording Environment
async function setupRecording() {
  try {
    // Get access to Display Screen
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    // Get access to Audio (Mic)
    audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Call for Video Feedback - Live Preview of recording
    setupVideoFeedback();
  } catch (error) {
    // Handle error

    console.error(error);
    alert("Error: The required permission could not be obtained!");
    window.location.reload();
  }
}

// Function to display the live preview of what is being recorded
function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".video-feedback");
    video.srcObject = stream;
    video.play();
  } else {
    console.warn("No stream available!");
    alert("Error: Invalid sources!");
  }
}

// Start Recording Function
async function startRecording() {
  await setupRecording();

  if (stream && audio) {
    // Combine both video & audio stream with MediaStream object
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);

    // Record the captured mediaStream with MediaRecorder constructor
    recorder = new MediaRecorder(mixedStream);

    // Start the recording
    recorder.start(200);

    // When data is available - call handleDataAvailable
    recorder.ondataavailable = handleDataAvailable;

    // When recording is stopped - call handleStop
    recorder.onstop = handleStop;

    // As recording has started - disable Start Button & enable Stop Button
    startButton.disabled = true;
    stopButton.disabled = false;

    const start = document.querySelector(".start-recording");
    start.classList.add("cursor-not-allowed");

    const stop = document.querySelector(".stop-recording");
    stop.classList.remove("cursor-not-allowed");

    console.log("Recording started...");
  } else {
    // Handle error
    console.warn("Error: Invalid sources!");
    alert("Error: Invalid sources!");
  }
}

// Stop Recording Function
function stopRecording() {
  // Stop the recording
  recorder.stop();
  console.log("Recording has stopped!");
}

function handleDataAvailable(e) {
  // Push the recorded data to dataChunks array when data available
  dataChunks.push(e.data);
}

function handleStop(e) {
  // Convert the recorded media to blob type mp4 media
  const blob = new Blob(dataChunks, {
    type: "video/mp4",
  });

  // Clear the dataChunks array
  dataChunks = [];

  // Convert the blob data to a url
  blobUrl = URL.createObjectURL(blob);

  // Assign the url to the downloadButton (anchor tag) for download
  downloadButton.href = blobUrl;
  // Assign the url to the recordedVideo (video tag) for after recording preview
  recordedVideo.src = blobUrl;

  // Load recordedVideo (video tag) to display recorded video
  recordedVideo.load();

  // Default video file name
  downloadButton.download = "video_screnoo.mp4";

  // Clear blob memory
  URL.revokeObjectURL(blob);

  // On completion of recording
  recordedVideo.onloadeddata = () => {
    // Hide recording/ home screen
    const vr = document.querySelector(".video-recorder");
    vr.classList.add("hidden");

    // Display Download Screen
    const rc = document.querySelector(".recorded-video-wrap");
    rc.classList.remove("hidden");

    // Play recorded video
    recordedVideo.play();
  };

  // Disable sharing prompt from screen
  stream.getTracks().forEach((track) => track.stop());
  audio.getTracks().forEach((track) => track.stop());

  console.log("Your video is ready!");
}

// Home button
function backToHome() {
  let backHome = confirm(
    "Warning: Data will be lost if you leave the page! Are you sure?"
  );
  if (backHome) {
    window.location.reload();
  }
}

// Program starts here - After page is fully loaded
window.addEventListener("load", () => {
  startButton = document.querySelector(".start-recording");
  stopButton = document.querySelector(".stop-recording");
  downloadButton = document.querySelector(".download-video");
  recordedVideo = document.querySelector(".recorded-video");
  homeButton = document.querySelector(".back-to-home");
  logoButton = document.querySelector(".logo"); // Logo -> Home button

  // Starts recording
  startButton.addEventListener("click", startRecording);
  // Stops recording
  stopButton.addEventListener("click", stopRecording);
  // Takes to home page
  homeButton.addEventListener("click", backToHome);
  // Takes to home page
  logoButton.addEventListener("click", backToHome);
});

// Developed with love by Shibam Saha
