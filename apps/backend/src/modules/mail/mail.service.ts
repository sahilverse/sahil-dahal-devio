import { injectable, inject } from "inversify";
import fs from "fs";
import path from "path";
import type { Transporter } from "nodemailer";
import { TYPES } from "../../types";

@injectable()
export class MailService {
    constructor(
        @inject(TYPES.Transporter) private readonly transporter: Transporter
    ) { }

    async sendPasswordResetEmail(to: string, resetToken: string, resetLink: string): Promise<void> {
        const template = this.loadTemplate("reset-password", {
            RESET_TOKEN: resetToken,
            RESET_LINK: resetLink,
        });
        await this.sendMail(to, "Devio Password Reset", template);
    }

    async sendEmailVerificationEmail(to: string, verificationToken: string, verificationLink: string): Promise<void> {
        const template = this.loadTemplate("email-verification", {
            VERIFICATION_CODE: verificationToken,
            VERIFICATION_LINK: verificationLink,
        });
        await this.sendMail(to, "Devio Email Verification", template);

    }

    private loadTemplate(templateName: string, variables: Record<string, string> = {}): string {
        const filePath = path.join(process.cwd(), "src/modules/mail/templates", `${templateName}.html`);
        let template = fs.readFileSync(filePath, "utf-8");

        // Replace placeholders : {{PLACEHOLDER}}
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            template = template.replace(regex, value);
        });

        return template;
    }

    private async sendMail(to: string, subject: string, html: string) {
        return this.transporter.sendMail({
            from: "Devio <devio.platform@gmail.com>",
            to,
            subject,
            html,
        });
    }

}
