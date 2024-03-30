function generateEmailContent(username, email, teamName, userMessage, inviteLink) {
    const logoUrl =
        "https://firebasestorage.googleapis.com/v0/b/prontoai-playground.appspot.com/o/logo%2Fsatoshi_safe_2xlogo.png" +
        "?alt=media&token=b4cafd51-08a7-4622-9b87-772c77f78be7";

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome Aboard!</title>
            <link href="https://fonts.googleapis.com/css?family=Adamina&display=swap" rel="stylesheet">    
        <style>
            body {
                font-family: 'Adamina', serif;
                text-align: center;
                padding: 40px;
                background-color: #edf2f7;
            }

            .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                margin: auto;
                max-width: 500px;
            }

            .logo {
                margin-bottom: 20px;
            }

            .message {
                font-size: 16px;
                margin-top: 20px;
                color: #0F2143;
            }

            .button:hover {
                background-color: #46586d;
            }
            .footer {
                padding-top: 20px;
                font-size: 12px;
                text-align: center;
                color: #718096;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="${logoUrl}" alt="Logo" style="max-width: 160px; margin-bottom: 10px;">
            </div>
            <h2>Welcome to Satoshi Safe!</h2>
            <p>Dear ${username},</p>
            <p>We're thrilled to let you know that <strong>${username}</strong> (<a href="mailto:${email}">${email}</a>)
            has invited you to join the Satoshi Safe team named "<strong>${teamName}</strong>". 
            It's a place where collaboration, security, 
            and innovation meet. We're excited to see how you'll contribute to our community.</p>
            <p>To get started, simply click on the button below and follow the instructions to set up your account. 
            If you need any guidance or have questions along the way,
            our support team is just an email away and eager to assist you.</p>
            <a href="${inviteLink}" class="button" style="color: white; background-color: #5b718a; padding: 10px 20px; 
            text-align: center; text-decoration: none; display: inline-block; font-size: 16px; 
            margin: 20px 2px; border-radius: 5px; transition: background-color 0.2s ease;">Join the Team</a>
            <p class="footer">Feel free to reach out to us at any time. 
            Welcome to the team, and we can't wait to achieve great things together!</p>
            <p class="footer">Warm regards,</p>
            <p class="footer">The Satoshi Safe Team</p>
        </div>
    </body>
    </html>
    `;
}

module.exports = {
    generateEmailContent,
};
