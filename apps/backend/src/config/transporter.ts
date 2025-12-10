import nodemailer from "nodemailer";
import { SMTP_EMAIL_USER, SMTP_EMAIL_PASS } from "./constants";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: SMTP_EMAIL_USER,
        pass: SMTP_EMAIL_PASS,
    },
})

export { transporter };