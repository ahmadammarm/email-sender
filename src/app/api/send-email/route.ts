/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import { NewsItem } from '@/types/newsitem';

export async function POST(request: NextRequest) {

    try {
        const body = await request.json();

        const { emails, newsItems } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({
                error: 'Minimal 1 email diperlukan',
            }, {
                status: 400,
            })
        }

        if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
            return NextResponse.json({
                error: 'Minimal 1 berita diperlukan',
            }, {
                status: 400,
            })
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS,
            },
        })

        const results: {
            title: string;
            success: boolean;
            error?: string;
            recipients: number
        }[] = [];

        const allProcessedItem: NewsItem[] = [];

        const allAttachments: any[] = [];

        const emailHTML = EmailBody(allProcessedItem, '');

        try {
            const info = await transporter.sendMail({
                from: '"Your Email" <news@example.com>',
                to: emails.join(','), // Mengirim ke semua email yang ditambahkan
                subject: `Newsletter Your Email: ${newsItems.length} Berita Terbaru`,
                html: emailHTML,
                attachments: allAttachments,
            });

            console.log(`Berhasil kirim email ke ${emails.length} penerima: ${info.messageId}`);

            // Catat hasil untuk semua berita
            for (const item of newsItems) {
                results.push({
                    title: item.title,
                    success: true,
                    recipients: emails.length,
                });
            }

            return NextResponse.json({
                success: true,
                message: `Berhasil mengirim ${newsItems.length} berita ke ${emails.length} penerima`,
                results,
            });
        } catch (error: any) {
            console.error('Error processing news items:', error);
            return NextResponse.json({
                error: 'Terjadi kesalahan saat memproses berita',
            }, {
                status: 500,
            });
        }


    } catch (error: any) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({
            error: 'Terjadi kesalahan saat mengirim email',
        }, {
            status: 500,
        });
    }


}