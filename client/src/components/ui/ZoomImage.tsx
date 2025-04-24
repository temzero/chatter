import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoomImageProps {
    src: string;
    alt: string;
    maxZoom?: number;
    minZoom?: number;
    zoomStep?: number;
    initialZoom?: number;
    transitionDuration?: number;
    className?: string;
    containerClassName?: string;
    enablePan?: boolean;
}

const ZoomImage: React.FC<ZoomImageProps> = ({
    src,
    alt,
    maxZoom = 3,
    minZoom = 1,
    zoomStep = 0.2,
    initialZoom = 1,
    transitionDuration = 200, // in ms
    className,
    containerClassName,
    enablePan = true,
}) => {
    const [zoom, setZoom] = useState(initialZoom);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false); // Track if image is zoomed
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to handle zoom
    const handleZoom = useCallback(
        (delta: number) => {
            setZoom((prevZoom) => {
                const newZoom = Math.max(minZoom, Math.min(maxZoom, prevZoom + delta));
                return newZoom;
            });
        },
        [minZoom, maxZoom]
    );

    // Zoom in and out
    const zoomIn = () => handleZoom(zoomStep);
    const zoomOut = () => handleZoom(-zoomStep);

    // Toggle zoom and reset position
    const toggleZoom = () => {
        if (isZoomed) {
            setZoom(initialZoom);
            setPosition({ x: 0, y: 0 });
        } else {
            handleZoom(zoomStep); // Or any value to zoom in
        }
        setIsZoomed(!isZoomed);
    };

    // Handle mouse wheel zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                handleZoom(zoomStep);
            } else if (e.deltaY > 0) {
                handleZoom(-zoomStep);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleZoom, zoomStep]);

    // Handle mouse drag events
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!enablePan || !isZoomed) return; // Only pan when zoomed
        setIsDragging(true);
        setStartPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        e.stopPropagation();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - startPosition.x,
            y: e.clientY - startPosition.y,
        });
        e.stopPropagation();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add mouse up listener to window to catch mouse up events outside the container
    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Apply styles with transitions
    const imageStyle = {
        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        transition: isDragging ? 'none' : `transform ${transitionDuration}ms ease-out`,
        cursor: enablePan && isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative overflow-hidden',
                containerClassName
            )}
            style={{
                width: '100%',
                height: '100%',
                cursor: isZoomed && enablePan ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onMouseUp={handleMouseUp} // Attach mouseup to the container
            onMouseMove={handleMouseMove} // Attach mousemove to the container
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className={cn('transition-transform', className)}
                style={imageStyle}
                onMouseDown={enablePan && isZoomed ? handleMouseDown : undefined}
                onClick={toggleZoom} // Single click zoom in/out
                draggable={false} // Prevent default drag
            />
            {/* Controls */}
            <div className="absolute top-2 left-2 z-10 flex gap-2">
                <Button variant="outline" size="icon" onClick={zoomIn} aria-label="Zoom In">
                    <Plus className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={zoomOut} aria-label="Zoom Out">
                    <Minus className="w-4 h-4" />
                </Button>
                {enablePan && (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={!isZoomed}
                        title={isZoomed ? "Pan Mode (Drag to move)" : "Pan Mode (Zoom in to enable)"}
                        aria-label="Pan Mode"
                    >
                        <Move className={cn("w-4 h-4", isZoomed ? "text-blue-500" : "text-gray-400")} />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ZoomImage;
