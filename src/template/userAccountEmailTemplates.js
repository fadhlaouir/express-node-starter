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
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html;utf-8" />
    <title>
      Confirmation de votre inscription
    </title>
  </head>

  <body style="max-width: 400px">
    <div>
      <p>Bonjour ${fullName},</p>
      <p>
        Nous vous remercions pour votre inscription.
      </p>
      <p>Votre nom d'utilisateur est : ${email}</p>
      <p>Veuillez suivre ce lien pour activer votre compte :</p>
      <a href="${API_ENDPOINT}/account/${confirmationCode}/enable"
        >Je confirme que je souhaite activer mon compte
      </a>
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
<html>
  <head>
    <title>
      Reinitialisation de votre mot de passe
    </title>
  </head>
  <body>
    <div>
      <p>Bonjour ${fullName},</p>
      <p>
        Vous avez récemment fait une demande de réinitialisation du mot de passe
        de votre compte : ${email}
      </p>
      <p>
        Cliquez sur le lien ci-dessous pour commencer le processus de
        réinitialisation.
      </p>
      <a href="${API_ENDPOINT}/auth/reset-password/${token}">
        Réinitialisation de mot de passe
      </a>
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
<html>
  <head>
    <title>
      Confirmation de réinitialisation du mot de passe
    </title>
  </head>
  <body>
    <div>
      <p>Bonjour ${fullName},</p>
      <p>Votre mot de passe a été réinitialisé avec succès.</p>
      <p>
        Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
      </p>
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
