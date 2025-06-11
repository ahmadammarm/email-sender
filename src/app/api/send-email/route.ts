/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import { EmailData } from '@/types/emaildata';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { emailData } = body as { emailData: EmailData };

        if (!emailData) {
            return NextResponse.json({ error: 'Data berita diperlukan' }, { status: 400 });
        }

        if (!emailData.emails || !Array.isArray(emailData.emails) || emailData.emails.length === 0) {
            return NextResponse.json({ error: 'Minimal satu email diperlukan' }, { status: 400 });
        }

        if (!emailData.subject || !emailData.message) {
            return NextResponse.json({ error: 'Subject dan message diperlukan' }, { status: 400 });
        }

        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const attachments: any[] = [];
        let processedemailData = { ...emailData };

        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');

            if (fs.existsSync(logoPath)) {
                attachments.push({
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo'
                });
            } else {
                console.warn('Logo file not found, using fallback');
            }
        } catch (error) {
            console.warn('Error adding logo attachment:', error);
        }

        if (emailData.imageUrl) {
            if (emailData.imageUrl.startsWith('data:image')) {
                const matches = emailData.imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
                const imageType = matches ? matches[1] : 'jpeg';
                const base64Data = emailData.imageUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
                const fileName = `news-image.${imageType}`;

                attachments.push({
                    filename: fileName,
                    content: base64Data,
                    encoding: 'base64',
                    cid: 'news-image'
                });

                processedemailData.imageUrl = 'cid:news-image';
            }
        }

        const emailHtml = EmailBody([processedemailData], 'cid:logo');

        try {
            const info = await transporter.sendMail({
                from: '"Example Email" <news@example.com>',
                to: emailData.emails.join(','),
                subject: `Newsletter: ${emailData.subject}`,
                html: emailHtml,
                attachments: attachments
            });

            console.log(`Berhasil kirim email ke ${emailData.emails.length} penerima: ${info.messageId}`);

            return NextResponse.json({
                success: true,
                message: `Berhasil mengirim berita "${emailData.subject}" ke ${emailData.emails.length} penerima`,
                result: {
                    title: emailData.subject,
                    success: true,
                    recipients: emailData.emails.length,
                    messageId: info.messageId
                }
            });

        } catch (error) {
            console.error('Gagal mengirim newsletter:', error);

            return NextResponse.json({
                error: 'Terjadi kesalahan saat mengirim email',
                details: (error as Error).message,
                result: {
                    title: emailData.subject,
                    success: false,
                    recipients: 0,
                    error: (error as Error).message
                }
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            error: 'Terjadi kesalahan saat memproses permintaan',
            details: (error as Error).message
        }, { status: 500 });
    }
}