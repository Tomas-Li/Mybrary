const nodemailer = require('nodemailer')
const cloudinary = require('../config/cloudinary');


//imgPath: path of the img, normally it will be inside public/images
//tags: array of tags
function uploader(imgPath, tags) {
    cloudinary.uploader.upload(imgPath, { tags: tags }, function (err, image) {
        console.log();
        console.log("** File Upload");
        if (err) { console.warn(err); }
        console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
        console.log("* " + image.public_id);
        console.log("* " + image.url);
    })
}

//mailOptions( from, to, html/text )
function sendEmail(mailOptions){
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: process.env.NODEMAILER_SENDER_USER,
            pass: process.env.NODEMAILER_SENDER_PASS
            }
        });

        const mailData = {...mailOptions};

        transporter.sendMail(mailData, err => {
            if (err)
                console.log("There has been an error when sendin the email\n", err);
        })
    } catch (error) {
        throw error;
    }
}

async function sendVerificationEmail(user, req, res){
    try { 
        const token = user.generateVerificationToken();
        await token.save();

        let subject = "Account Verification Token";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link="http://"+req.headers.host+"/verify/"+token.token;
        let html = `<p>Hi ${user.firstName}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

        sendEmail({to, from, subject, html});

    } catch (error) {
        console.log("I failed sending the message! ")
    }
}

module.exports = {
    uploader: uploader,
    sendEmail: sendEmail,
    sendVerificationEmail: sendVerificationEmail
}