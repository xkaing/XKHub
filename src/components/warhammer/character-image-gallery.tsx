'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink, Images } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { WarhammerCharacterImage } from '@/lib/data/warhammer-characters'

interface CharacterImageGalleryProps {
  characterName: string
  images: WarhammerCharacterImage[]
}

export function CharacterImageGallery({ characterName, images }: CharacterImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="absolute bottom-3 right-3 rounded-md border bg-muted/70 px-2 py-1 text-xs text-muted-foreground">
        暂无官方图
      </div>
    )
  }

  const activeImage = images[activeIndex]
  const canSwitch = images.length > 1

  const showPrevious = () => setActiveIndex((index) => (index - 1 + images.length) % images.length)
  const showNext = () => setActiveIndex((index) => (index + 1) % images.length)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="absolute bottom-3 right-3 flex items-end rounded-md border bg-background/95 p-1.5 shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring"
          title={`查看 ${characterName} 的官方图片`}
        >
          <span className="mr-2 self-center whitespace-nowrap text-xs font-medium">官方图</span>
          <span className="relative flex h-12 w-20">
            {images.slice(0, 3).map((image, index) => (
              <img
                key={image.url}
                src={image.url}
                alt={image.title}
                loading="lazy"
                className="absolute bottom-0 size-12 rounded-md border-2 border-background bg-muted object-cover shadow-md"
                style={{ right: `${index * 18}px`, zIndex: images.length - index }}
              />
            ))}
          </span>
          <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-md border bg-muted px-1.5 text-xs font-medium">
            <Images className="mr-1 size-3" />
            {images.length}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl gap-4 p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle>{characterName}</DialogTitle>
          <DialogDescription>
            {activeImage.kind} · {activeImage.source} · {activeIndex + 1} / {images.length}
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-md border bg-muted/30">
          <img
            src={activeImage.url}
            alt={activeImage.title}
            className="max-h-[64vh] w-full object-contain"
          />
          {canSwitch ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 shadow"
                onClick={showPrevious}
                title="上一张"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 shadow"
                onClick={showNext}
                title="下一张"
              >
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">{activeImage.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{activeImage.source}</div>
          </div>
          <Button asChild variant="outline" size="sm" className="self-start md:self-auto">
            <a href={activeImage.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" />
              官方来源
            </a>
          </Button>
        </div>

        {canSwitch ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                className={`size-16 shrink-0 overflow-hidden rounded-md border transition ${
                  index === activeIndex ? 'border-primary ring-2 ring-ring' : 'border-border opacity-70 hover:opacity-100'
                }`}
                onClick={() => setActiveIndex(index)}
                title={image.title}
              >
                <img src={image.url} alt={image.title} loading="lazy" className="size-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
