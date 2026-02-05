"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Area, Point } from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { ModalHeader } from "./upload-modal/ModalHeader";
import { ImagePreviewArea } from "./upload-modal/ImagePreviewArea";
import { CropControls } from "./upload-modal/CropControls";
import { ModalActions } from "./upload-modal/ModalActions";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";

type UploadVariant = "avatar" | "banner";

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (file: File) => void;
    onRemove?: () => void;
    variant: UploadVariant;
    title?: string;
    accept?: string;
    currentUrl?: string | null;
}

export default function ImageUploadModal({
    isOpen,
    onClose,
    onSave,
    onRemove,
    variant,
    title,
    accept = "image/*",
    currentUrl,
}: ImageUploadModalProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const isAvatar = variant === "avatar";
    const aspect = isAvatar ? 1 : 1500 / 500;

    const onCropComplete = useCallback((_preventedArea: Area, _croppedAreaPixels: Area) => {
        setCroppedAreaPixels(_croppedAreaPixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImageSrc(reader.result as string);
        });
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedBlob) {
                const file = new File([croppedBlob], "image.webp", { type: "image/webp" });
                onSave(file);
                handleClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setShowConfirmDelete(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

                <div className="relative bg-card text-card-foreground border rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6 overflow-hidden">
                    <ModalHeader
                        title={title ?? (isAvatar ? "Avatar image" : "Banner image")}
                        onClose={handleClose}
                    />

                    <div className="relative">
                        <ImagePreviewArea
                            isAvatar={isAvatar}
                            imageSrc={imageSrc}
                            currentUrl={currentUrl}
                            showConfirmDelete={showConfirmDelete}
                            onFileClick={() => fileInputRef.current?.click()}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />

                        <CropControls
                            imageSrc={imageSrc}
                            showConfirmDelete={showConfirmDelete}
                            zoom={zoom}
                            onZoomChange={setZoom}
                            onFileSelectClick={() => fileInputRef.current?.click()}
                        />
                    </div>

                    <ModalActions
                        currentUrl={currentUrl}
                        imageSrc={imageSrc}
                        onRemove={onRemove}
                        showConfirmDelete={showConfirmDelete}
                        isProcessing={isProcessing}
                        onDeleteClick={() => setShowConfirmDelete(true)}
                        onCancel={handleClose}
                        onSave={handleSave}
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={() => {
                    onRemove?.();
                    handleClose();
                }}
                title={`Delete ${variant}?`}
                description={`This will permanently remove your current ${variant}. This action cannot be undone.`}
            />
        </>
    );
}
