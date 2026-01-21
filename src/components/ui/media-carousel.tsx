import * as React from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  label: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
  showThumbnails?: boolean;
}

export function MediaCarousel({ items, className, showThumbnails = true }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const validItems = items.filter(item => item.url);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? validItems.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [validItems.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === validItems.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [validItems.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') {
      setIsFullscreen(false);
      setIsZoomed(false);
    }
  }, [goToPrevious, goToNext]);

  if (validItems.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-muted rounded-lg", className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  const currentItem = validItems[currentIndex];

  const MediaDisplay = ({ item, fullscreen = false }: { item: MediaItem; fullscreen?: boolean }) => (
    <div className={cn(
      "relative flex items-center justify-center",
      fullscreen ? "w-full h-full" : "aspect-video"
    )}>
      {item.type === 'video' ? (
        <video
          src={item.url}
          controls
          className={cn(
            "max-w-full max-h-full rounded-lg",
            fullscreen && "max-h-[80vh]"
          )}
        />
      ) : (
        <img
          src={item.url}
          alt={item.label}
          className={cn(
            "max-w-full max-h-full object-contain rounded-lg transition-transform duration-200",
            isZoomed && fullscreen && "scale-150 cursor-zoom-out",
            !isZoomed && fullscreen && "cursor-zoom-in"
          )}
          onClick={() => fullscreen && setIsZoomed(!isZoomed)}
        />
      )}
    </div>
  );

  return (
    <div 
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main display */}
      <div className="relative bg-muted/50 rounded-lg overflow-hidden">
        <MediaDisplay item={currentItem} />

        {/* Navigation arrows */}
        {validItems.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Fullscreen button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          onClick={() => setIsFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Label */}
        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm font-medium">
          {currentItem.label}
        </div>

        {/* Counter */}
        <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {validItems.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && validItems.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {validItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                index === currentIndex 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-xs">Video</span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background/95 backdrop-blur">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-medium">{currentItem.label}</span>
              <div className="flex items-center gap-2">
                {currentItem.type === 'image' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsZoomed(!isZoomed)}
                  >
                    {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Media */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <MediaDisplay item={currentItem} fullscreen />
            </div>

            {/* Navigation */}
            {validItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Thumbnails at bottom */}
            <div className="flex justify-center gap-2 p-4 border-t overflow-x-auto">
              {validItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsZoomed(false);
                  }}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                    index === currentIndex 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs">Video</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
