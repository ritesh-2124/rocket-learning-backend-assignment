const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

const sqs = new AWS.SQS({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
require('dotenv').config();

const queueURL = process.env.SQS_QUEUE_URL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;

//Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

//Function to Send Messages to SQS Queue
const sendBookingToQueue = async (bookingDetails, userId) => {
    const params = {
        QueueUrl: queueURL,
        MessageBody: JSON.stringify(bookingDetails),
        MessageGroupId: `user_${userId}`,
        MessageDeduplicationId: `${userId}-${Date.now()}`
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        console.log('Message sent to SQS:', data.MessageId);
        return data.MessageId;
    } catch (err) {
        console.error('Error sending message to SQS:', err);
        throw err;
    }
};

// Function to Poll SQS and Process Messages Continuously
const receiveMessages = async () => {
    while (true) {
        const params = {
            QueueUrl: queueURL,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            VisibilityTimeout: 30
        };

        try {
            const data = await sqs.receiveMessage(params).promise();

            if (data.Messages) {
                console.log(`Received ${data.Messages.length} messages from SQS`);

                for (const message of data.Messages) {
                    const bookingDetails = JSON.parse(message.Body);

                    const mailOptions = {
                        from: emailUser,
                        to: bookingDetails.email,
                        subject: '✈️ Flight Booking Status',
                        html: `<p>Hello ${bookingDetails.name},</p>
                        <p>Your booking status is <strong>${bookingDetails.flight_status}</strong> for flight <strong>${bookingDetails.flight_no}</strong> from <strong>${bookingDetails.source}</strong> to <strong>${bookingDetails.destination}</strong> on <strong>${bookingDetails.date}</strong>.</p>`
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Email sent to ${bookingDetails.email}`);

                        //Delete processed message
                        await sqs.deleteMessage({
                            QueueUrl: queueURL,
                            ReceiptHandle: message.ReceiptHandle
                        }).promise();
                        console.log('Processed message deleted from SQS');
                    } catch (emailError) {
                        console.error('Error sending email:', emailError);
                    }
                }
            } else {
                console.log('No messages available in the queue.');
            }
        } catch (sqsError) {
            console.error('Error receiving messages from SQS:', sqsError);
        }
    }
};

// Start polling for messages automatically
receiveMessages().catch(console.error);

module.exports = { sendBookingToQueue ,transporter };