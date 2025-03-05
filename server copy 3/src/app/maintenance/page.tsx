'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
    const contactViaWhatsApp = () => {
        const message = encodeURIComponent("Halo Worklytic, saya ingin menanyakan tentang status pembayaran saya.");
        window.open(`https://api.whatsapp.com/send?phone=6282112481600&text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-cyan-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-cyan-600 text-white p-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Worklytic Dashboard</h1>
                    <p className="text-cyan-100">Platform Freelance Terbaik di Indonesia</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="relative w-24 h-24 md:w-32 md:h-32">
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-600" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Website Sedang Dalam Pengembangan</h2>
                        <p className="text-gray-600 mb-4">
                            Mohon maaf, dashboard website Worklytic saat ini sedang dalam tahap pengembangan. 
                            Untuk sementara, fitur lengkap hanya tersedia di aplikasi mobile.
                        </p>
                        <p className="text-gray-600">
                            Anda dapat melihat saldo dan riwayat transaksi secara lengkap melalui aplikasi Worklytic di perangkat mobile Anda.
                        </p>
                    </div>

                    {/* Information Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5 mb-8">
                        <h3 className="font-bold text-gray-800 mb-2">Butuh Informasi Lebih Lanjut?</h3>
                        <p className="text-gray-600 mb-3">
                            Jika Anda memiliki pertanyaan tentang:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
                            <li>Status pembayaran Anda</li>
                            <li>Riwayat transaksi</li>
                            <li>Bukti pembayaran</li>
                            <li>Detail proyek</li>
                            <li>Informasi lainnya</li>
                        </ul>
                        <p className="text-gray-600">
                            Tim dukungan kami siap membantu Anda melalui WhatsApp.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button 
                            onClick={contactViaWhatsApp}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.5a8 8 0 0 0-8 8c0 1.422.392 2.659 1.076 3.875L4.5 19.5l3.198-.577A8 8 0 0 0 20 12.5a7.85 7.85 0 0 0-2.4-6.18zM12 18.5a6.6 6.6 0 0 1-3.646-1.102l-.295-.165-2.058.386.408-1.97-.208-.32A6.24 6.24 0 0 1 5.5 12.5a6.86 6.86 0 0 1 2.541-5.164A7.34 7.34 0 0 1 12 6.5a6.58 6.58 0 0 1 4.65 1.825A6.48 6.48 0 0 1 18.5 12.5a6.5 6.5 0 0 1-6.5 6z"/>
                            </svg>
                            Hubungi via WhatsApp
                        </button>
                        <a 
                            href="mailto:support@worklytic.com"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Email Support
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Worklytic. Semua Hak Dilindungi.</p>
                    <div className="mt-2 space-x-4">
                        <Link href="/terms" className="text-cyan-600 hover:text-cyan-800">Syarat & Ketentuan</Link>
                        <Link href="/privacy" className="text-cyan-600 hover:text-cyan-800">Kebijakan Privasi</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}