'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Save, Loader2, X, Check } from 'lucide-react'
import { updateProfile } from './actions'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'

export function ProfileForm({ initialName, initialAvatarUrl }: { initialName: string, initialAvatarUrl: string }) {
    const router = useRouter()
    const [name, setName] = useState(initialName || '')
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '')
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cropping states
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isCropping, setIsCropping] = useState(false)

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            if (selected.size > 5 * 1024 * 1024) {
                setError("Image must be less than 5MB")
                return
            }

            // Read file for cropping instead of setting it immediately
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''))
            reader.readAsDataURL(selected)
            setError('')

            // Reset state
            setCrop({ x: 0, y: 0 })
            setZoom(1)

            // Allow selecting same file again
            e.target.value = ''
        }
    }

    const showCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsCropping(true)
            const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedImageFile) {
                setFile(croppedImageFile)
                setAvatarUrl(URL.createObjectURL(croppedImageFile))
                setImageSrc(null) // close modal
            }
        } catch (e) {
            console.error(e)
            setError("Failed to crop image")
        } finally {
            setIsCropping(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('name', name)
            if (file) {
                formData.append('avatar', file)
            }

            const res = await updateProfile(formData)

            if (res.error) {
                setError(res.error)
            } else {
                router.refresh() // Refreshes the server components to update the stats and layouts immediately
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Determine if the form hasn't changed to disable the button
    const isUnchanged = (!file && name === initialName)

    return (
        <div className="bg-[var(--background-card)]/60 border border-[var(--border)] p-6 rounded-3xl mb-8 relative overflow-hidden">
            {/* Glow effect matching the premium theme */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

            <form onSubmit={handleSubmit} className="flex flex-col items-center relative z-10">

                {/* Avatar Uploader */}
                <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-28 h-28 rounded-full border-2 border-amber-500/50 bg-[var(--background-raised)] overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.2)] text-3xl font-bold font-serif text-[var(--foreground-subtle)]">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            name?.[0]?.toUpperCase() || '?'
                        )}
                        <div className="absolute inset-0 bg-[var(--background)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            <Camera className="text-white w-6 h-6" />
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--foreground-muted)]">Edit Photo</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-amber-500 p-2.5 rounded-full border-4 border-black text-black shadow-lg hover:scale-110 transition-transform">
                        <Camera size={14} className="fill-black" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </div>

                {error && (
                    <div className="w-full text-center text-red-500 text-xs font-bold mb-4 bg-red-950/30 p-2 rounded-lg border border-red-900/50">
                        {error}
                    </div>
                )}

                {/* Name Input */}
                <div className="w-full mb-6 relative">
                    <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wider text-center">Player Display Name</label>
                    <input
                        type="text"
                        value={name}
                        maxLength={12}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-[var(--background)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-center text-xl shadow-inner"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isUnchanged}
                    className="w-full py-4 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:grayscale active:scale-[0.98]"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSubmitting ? 'Saving changes...' : 'Save Profile'}
                </button>
            </form>

            {/* Cropper Modal Overlay */}
            {imageSrc && (
                <div className="fixed inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm flex flex-col p-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-4 mt-8">
                        <h3 className="text-xl font-bold font-serif text-[var(--foreground)]">Adjust Avatar</h3>
                        <button onClick={() => setImageSrc(null)} className="p-2 bg-[var(--background-card)] rounded-full text-[var(--foreground-muted)] hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative flex-1 w-full bg-[var(--background)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="mt-6 mb-8 flex flex-col gap-4 max-w-md mx-auto w-full">
                        <div className="px-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)] mb-2 block">Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>
                        <button
                            onClick={showCroppedImage}
                            disabled={isCropping}
                            className="w-full py-4 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                            {isCropping ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {isCropping ? 'Processing...' : 'Confirm Crop'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
