/**
 * Confirm user email to activate account to access to the app
 * @param {String} fullName User full name
 * @param {String} API_ENDPOINT Depend on the app running localy or server
 * @param {String} confirmationCode Generated unique code
 */
const singUpConfirmationEmailTemplate = (
  fullName,
  API_ENDPOINT,
  email,
  confirmationCode,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de votre inscription</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, p {
      margin: 0;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bonjour ${fullName},</h1>
    <p>Nous vous remercions pour votre inscription.</p>
    <p>Votre nom d'utilisateur est : ${email}</p>
    <p>Veuillez suivre ce lien pour activer votre compte :</p>
    <a href="${API_ENDPOINT}/account/${confirmationCode}/enable">Activer mon compte</a>
    <p>Cordialement.</p>
  </div>
</body>
</html>

`;

/**
 * Send Email to reset password
 * @param {String} fullName User full name
 * @param {*} email User email
 * @param {String} API_ENDPOINT Depend on the app running localy or server
 * @param {String} token Generated unique code
 * @returns
 */
const forgotPasswordEmailTemplate = (fullName, email, API_ENDPOINT, token) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, p {
      margin: 0;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bonjour ${fullName},</h1>
    <p>Vous avez récemment fait une demande de réinitialisation du mot de passe de votre compte : ${email}</p>
    <p>Cliquez sur le lien ci-dessous pour commencer le processus de réinitialisation.</p>
    <a href="${API_ENDPOINT}/auth/reset-password/${token}">Réinitialisation de mot de passe</a>
    <p>Cordialement.</p>
  </div>
</body>
</html>

`;

/**
 * Confirmation email after successful reset password
 * @param {String} fullName User full name
 * @returns
 */
const resetPasswordConfirmationEmailTemplate = (fullName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réinitialisation du mot de passe</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, p {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bonjour ${fullName},</h1>
    <p>Votre mot de passe a été réinitialisé avec succès.</p>
    <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
    <p>Cordialement.</p>
  </div>
</body>
</html>

`;

// export module
module.exports = {
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
};
