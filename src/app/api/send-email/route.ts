import { NextRequest } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    const body = await request.json();

    const {emails, subject, message} = body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS
        }
    })
}