const functions = require('@google-cloud/functions-framework');
const {Storage} = require('@google-cloud/storage');
const {google} = require('googleapis');
const nodemailer = require('nodemailer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Initialize Google Cloud Storage
const storage = new Storage();

// Initialize Gmail API
const gmail = google.gmail('v1');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN
  }
});

/**
 * Processes video from Google Form submission
 * @param {Object} req Cloud Function request context
 * @param {Object} res Cloud Function response context
 */
functions.http('processVideo', async (req, res) => {
  try {
    // Validate request
    if (!req.body) {
      throw new Error('No request body received');
    }

    const {
      videoFileId,
      startTime,
      endTime,
      email
    } = req.body;

    // Download video from Google Drive
    const tempFilePath = path.join(os.tmpdir(), 'input-video.mp4');
    await downloadFromDrive(videoFileId, tempFilePath);

    // Process video
    const outputPath = path.join(os.tmpdir(), 'output-video.mp4');
    await trimVideo(tempFilePath, outputPath, startTime, endTime);

    // Upload to Cloud Storage
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const fileName = `processed-${Date.now()}.mp4`;
    await bucket.upload(outputPath, {
      destination: fileName,
      metadata: {
        contentType: 'video/mp4'
      }
    });

    // Generate signed URL
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
    });

    // Send email
    await sendEmail(email, url);

    // Cleanup
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(outputPath);

    res.status(200).send('Video processed successfully');
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send(error.message);
  }
});

/**
 * Downloads file from Google Drive
 */
async function downloadFromDrive(fileId, destPath) {
  const drive = google.drive({version: 'v3', auth: await getAuth()});
  const dest = fs.createWriteStream(destPath);

  const res = await drive.files.get(
    {fileId, alt: 'media'},
    {responseType: 'stream'}
  );

  return new Promise((resolve, reject) => {
    res.data
      .on('end', () => resolve())
      .on('error', err => reject(err))
      .pipe(dest);
  });
}

/**
 * Trims video using FFmpeg
 */
function trimVideo(inputPath, outputPath, startTime, endTime) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

/**
 * Sends email with video link
 */
async function sendEmail(to, videoUrl) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Video is Ready!',
    html: `
      <h1>Your video has been processed!</h1>
      <p>Click the link below to download your trimmed video:</p>
      <a href="${videoUrl}">Download Video</a>
      <p>This link will expire in 7 days.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Gets authenticated Google API client
 */
async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  return auth.getClient();
}
