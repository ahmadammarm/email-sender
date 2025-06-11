import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {

    try {
        const body = await request.json();

        const { emails, subject, message } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({
                error: 'Minimal 1 email diperlukan',
            }, {
                status: 400
            })
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS
            }
        })

        const results: {
            title: string;
            success: boolean;
            error?: string;
            recipients: number
        }[] = [];
    } catch (error: any) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({
            error: 'Terjadi kesalahan saat mengirim email',
        }, {
            status: 500
        });
    }


}