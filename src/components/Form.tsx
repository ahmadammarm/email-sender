/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import type { FormData } from "@/types/formdata"
import { Send, AlertCircle, CheckCircle2, ExternalLink, Plus, Mail, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { NewsItem } from "@/types/emaildata"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"

export default function Form() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitResult, setSubmitResult] = useState<{
        success: boolean
        message: string
        previewUrl?: string
    } | null>(null)
    const [newsList, setNewsList] = useState<NewsItem[]>([])
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [emailInput, setEmailInput] = useState("")
    const [emailList, setEmailList] = useState<string[]>([])

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<FormData>()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setPreviewImage(null)
        }
    }

    const addEmail = () => {
        const email = emailInput.trim()

        // Basic email validation
        if (!email) return

        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        if (!emailRegex.test(email)) {
            toast?.error("Format email tidak valid")
            return
        }

        // Check if email already exists in the list
        if (emailList.includes(email)) {
            toast?.error("Email ini sudah ditambahkan")
            return
        }

        setEmailList([...emailList, email])
        setEmailInput("")
    }

    const removeEmail = (index: number) => {
        const updatedList = [...emailList]
        updatedList.splice(index, 1)
        setEmailList(updatedList)
    }

    const onSubmit = async (data: FormData) => {
        if (emailList.length === 0) {
            toast?.error("Minimal satu email harus ditambahkan")
            return
        }

        if (data.newsTitle && data.newsUrl) {
            const newsItem: NewsItem = {
                emails: emailList,
                subject: data.newsSubject,
                title: data.newsTitle,
                message: data.newsPreview,
                url: data.newsUrl,
                imageUrl: data.newsImage ? URL.createObjectURL(data.newsImage[0]) : undefined,
            }

            setNewsList([...newsList, newsItem])

            reset({
                newsTitle: "",
                newsUrl: "",
                newsPreview: "",
                newsImage: undefined,
            })

            setPreviewImage(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }

            return
        }

        if (newsList.length === 0) {
            setSubmitResult({
                success: false,
                message: "Tambahkan minimal satu berita sebelum mengirim newsletter",
            })
            return
        }

        setIsSubmitting(true)
        setSubmitResult(null)


        try {
            const response = await fetch("/api/send-newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    subject: data.newsSubject,
                    title: data.newsTitle,
                    message: data.newsPreview,
                    url: data.newsUrl,
                    imageUrl: data.newsImage ? URL.createObjectURL(data.newsImage[0]) : undefined,
                }),
            })

            const result = await response.json()

            if (response.ok) {
                setSubmitResult({
                    success: true,
                    message: "Newsletter berhasil dikirim!",
                    previewUrl: result.previewUrl,
                })
                reset()
                setPreviewImage(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            } else {
                setSubmitResult({
                    success: false,
                    message: result.error || "Terjadi kesalahan saat mengirim email.",
                })
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message: "Terjadi kesalahan saat mengirim email.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-t from-green-50 to-white">
            <main className="container mx-auto py-12 px-4">
                <Card className="max-w-3xl mx-auto shadow-xl border-green-100">
                    <CardHeader className="border-b border-green-100">
                        <CardTitle className="text-2xl text-black text-center">Kirim Newsletter</CardTitle>
                        <CardDescription className="text-center text-green-700">
                            Isi form di bawah untuk mengirimkan newsletter
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-black">Daftar Email Penerima</h3>

                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="email"
                                            placeholder="contoh@gmail.com"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            className="border-green-200 focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addEmail}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Tambah Email
                                    </Button>
                                </div>

                                {emailList.length > 0 ? (
                                    <div className="mt-2 p-3 border border-green-100 rounded-md bg-green-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-green-800">Email Penerima</h4>
                                            <Badge className="bg-green-700 text-white">{emailList.length}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {emailList.map((email, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-green-100">
                                                    <div className="flex items-center">
                                                        <Mail className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="text-sm text-gray-700">{email}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeEmail(index)}
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Belum ada email penerima ditambahkan</p>
                                )}
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                                    Subjek Email
                                </label>
                                <Input
                                    type="text"
                                    id="subject"
                                    placeholder="Masukkan subjek email"
                                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                                    {...register("newsSubject", {
                                        required: "Subjek email wajib diisi"
                                    })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="title" className="text-sm font-medium text-gray-700">
                                    Judul Newsletter
                                </label>
                                <Input
                                    type="text"
                                    id="title"
                                    placeholder="Masukkan judul newsletter"
                                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                                    {...register("newsTitle", {
                                        required: "Judul newsletter wajib diisi"
                                    })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">
                                    Pesan
                                </label>
                                <Textarea
                                    id="message"
                                    placeholder="Masukkan pesan untuk newsletter"
                                    rows={4}
                                    className="border-green-200 focus:border-green-500 focus:ring-green-500 resize-none"
                                    {...register("newsPreview", {
                                        required: "Pesan wajib diisi"
                                    })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="url" className="text-sm font-medium text-gray-700">
                                    URL Terkait
                                </label>
                                <Input
                                    type="url"
                                    id="url"
                                    placeholder="https://example.com"
                                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                                    {...register("newsUrl", {
                                        required: "URL wajib diisi",
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: "URL harus dimulai dengan http:// atau https://"
                                        }
                                    })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                                    Gambar (Opsional)
                                </label>
                                <Input
                                    type="file"
                                    id="imageUrl"
                                    ref={(e) => {
                                        fileInputRef.current = e
                                        register("newsImage").ref(e)
                                    }}
                                    className="border-green-200 focus:border-green-500 focus:ring-green-500 file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0 file:text-sm file:font-semibold
                                    file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {previewImage && (
                                    <div className="mt-3 border border-green-200 rounded-md p-2 bg-white">
                                        <p className="text-xs text-gray-600 mb-1 font-medium">Preview Gambar:</p>
                                        <img
                                            src={previewImage || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-md"
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5 mr-2" />
                                        Kirim Newsletter
                                    </>
                                )}
                            </Button>
                        </form>

                        {submitResult && (
                            <Alert
                                className={`mt-6 ${submitResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
                            >
                                <div className="flex items-center gap-2">
                                    {submitResult.success ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    <AlertTitle>{submitResult.success ? "Berhasil!" : "Gagal!"}</AlertTitle>
                                </div>
                                <AlertDescription className="mt-2">
                                    {submitResult.message}
                                    {submitResult.previewUrl && (
                                        <div className="mt-2">
                                            <a
                                                href={submitResult.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Lihat preview email
                                            </a>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}