const Mailgun = require("mailgun-js");
const dotenv = require("dotenv");
dotenv.config();

// Mailgun istemcisini oluşturun
const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// E-posta gönderimini sağlayan fonksiyon
const sendEmail = async (to, subject, html) => {
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to: to,
    subject: subject,
    html: html,
  };

  return new Promise((resolve, reject) => {
    mailgun.messages().send(data, (error, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

// Şifre sıfırlama e-postası gönderen fonksiyon
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Şifre Sıfırlama";
  const resetPasswordUrl = `http://localhost:2020/api/v1/auth/reset-password?token=${token}`;
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007bff;
            color: #fff;
            text-align: center;
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: block;
            width: 100%;
            background-color: #007bff;
            color: #fff;
            padding: 10px 0;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
          }
          .button span {
            color: #fff; /* Butonun içindeki metnin rengi */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Şifre Sıfırlama</h1>
          </div>
          <div class="content">
            <p>Sayın kullanıcı,</p>
            <p>Şifrenizi sıfırlamak için lütfen aşağıdaki bağlantıya tıklayın:</p>
            <a href="${resetPasswordUrl}" class="button"><span>Şifre Sıfırlama</span></a>
            <p style="margin-top: 20px;">Eğer şifre sıfırlama isteği yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, subject, html);
};

// E-posta adresini doğrulama e-postası gönderen fonksiyon
const sendVerificationEmail = async (to, token) => {
  const subject = "E-posta Doğrulama";
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 400px;
          margin: 50px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: #fff;
          text-align: center;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: block;
          width: 100%;
          background-color: #007bff;
          color: #fff;
          padding: 10px 0;
          text-align: center;
          text-decoration: none;
          border-radius: 4px;
        }
        .button span {
          color: #fff; /* Butonun içindeki metnin rengi */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>E-posta Doğrulama</h1>
        </div>
        <div class="content">
          <p>Sayın kullanıcı,</p>
          <p>E-posta adresinizi doğrulamak için lütfen aşağıdaki bağlantıya tıklayın:</p>
          <a href="${verificationEmailUrl}" class="button"><span>E-posta Doğrulama</span></a>
          <p style="margin-top: 20px;">Eğer hesap oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      </div>
    </body>
  </html>
`;
  await sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
