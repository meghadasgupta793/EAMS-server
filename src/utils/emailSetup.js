const nodemailer = require("nodemailer");
const { smtpUserName, smtpPassword } = require("../secret");




const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: smtpUserName,
      pass: smtpPassword,
    },
  });


  const emailWithNodemailer = async(emailData)=>{
try {
    const mailOptions={
        from: smtpUserName, // sender address
        to: emailData.Email, // list of receivers
        subject: emailData.subject, // Subject line
        text: "Hello world?", // plain text body
        html: emailData.html, // html body
      };
       
      const info= await transporter.sendMail(mailOptions);
      console.log('messege sent: %s',info.response)
} catch (error) {
    console.error('Error occurd while sending email: ',error);
   
    
}
  
  };

  module.exports=emailWithNodemailer;