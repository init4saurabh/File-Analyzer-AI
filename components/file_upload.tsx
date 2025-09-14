"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"


interface FileWithPreview extends File {
  preview?: string
}

interface DragDropUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

export function DragDropUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
  className,
}: DragDropUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type)
      }
      if (type.includes("*")) {
        const baseType = type.split("/")[0]
        return fileType.startsWith(baseType)
      }
      return fileType === type
    })

    if (!isValidType) {
      return `File "${file.name}" is not a supported file type.`
    }

    return null
  }

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileWithPreview[] = []
      const errors: string[] = []

      Array.from(fileList).forEach((file) => {
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(validationError)
          return
        }

        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed.`)
          return
        }

        const fileWithPreview = file as FileWithPreview

        // Create preview for images
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }

        newFiles.push(fileWithPreview)
      })

      if (errors.length > 0) {
        setError(errors[0])
        setTimeout(() => setError(null), 5000)
      } else {
        setError(null)
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
      }
    },
    [files, maxFiles, maxSize, acceptedTypes, onFilesChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    },
    [processFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ""
    },
    [processFiles],
  )

  const removeFile = useCallback(
    (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)

      // Revoke object URL to prevent memory leaks
      const fileToRemove = files[index]
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }

      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, onFilesChange],
  )

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "relative border-2 border-dashed transition-colors duration-200 ease-in-out",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload
            className={cn("h-10 w-10 mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
          />

          <div className="space-y-2">
            <p className="text-lg font-medium">{isDragOver ? "Drop files here" : "Drag & drop files here"}</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </div>

          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  {file.preview ? (
                    <img
                      src={file.preview || "/placeholder.svg"}
                      alt={file.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
