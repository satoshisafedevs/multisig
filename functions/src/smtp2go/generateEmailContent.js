function generateEmailContent(username, email, teamName, userMessage, inviteLink) {
    const logoUrl =
        "https://firebasestorage.googleapis.com/v0/b/" +
        "prontoai-playground.appspot.com/o/logo%2FScreen%20Shot%202023-08-08%20at%2011.09.03%20AM.png" +
        "?alt=media&token=cf69a5c3-3f33-4637-a0fc-73b34c7353d9";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Join Satoshi Safe</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                color: #2d3748;
            }

            .button {
                background-color: #319795; 
                padding: 10px 20px; 
                text-align: center; 
                text-decoration: none; 
                display: inline-block; 
                font-size: 16px; 
                margin: 20px 2px; 
                border-radius: 5px; 
                transition: background-color 0.2s ease;
            }

            .button:hover {
                background-color: #2c7a7b;
            }
        </style>
    </head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
                <td align="center">
                    <div class="container">
                        <div class="logo">
                            <img src="${logoUrl}" alt="Logo">
                        </div>
                        <h2 style="font-size: 24px; color: #2d3748; font-weight: bold;">
                        Welcome to Satoshi Safe
                        </h2>
                        <p class="message">You've been invited by 
                        <strong>${username}</strong> (<a href="mailto:${email}" style="color: #319795; 
                        text-decoration: none;">${email}</a>) to join a team named <strong>${teamName}</strong>.</p>
                        <p style="font-size: 16px; margin-top: 10px; color: #2d3748;"><em>"${userMessage}"</em></p>
                        <a href="${inviteLink}" class="button" style="color: white;">Join the Team</a>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

module.exports = {
    generateEmailContent,
};
