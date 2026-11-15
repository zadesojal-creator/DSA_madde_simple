import { useState, useEffect, useCallback, useRef } from 'react';
import type { TraceStep, PlaybackSpeed } from '../types/trace';

interface UsePlaybackOptions {
  steps: TraceStep[];
  initialSpeed?: PlaybackSpeed;
  autoPlay?: boolean;
}

export function usePlayback({ steps, initialSpeed = 1, autoPlay = false }: UsePlaybackOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [speed, setSpeed] = useState<PlaybackSpeed>(initialSpeed);

  const totalSteps = steps.length;
  const safeStepIndex = totalSteps > 0 ? Math.min(currentStepIndex, totalSteps - 1) : 0;
  const isAtEnd = totalSteps > 0 && safeStepIndex >= totalSteps - 1;
  const isAtStart = safeStepIndex <= 0;

  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Active step snapshot
  const currentStep: TraceStep | undefined = steps[safeStepIndex];

  const playFromStart = useCallback((stepCount?: number) => {
    setCurrentStepIndex(0);
    const count = stepCount ?? stepsRef.current.length;
    setIsPlaying(count > 1);
  }, []);

  const play = useCallback(() => {
    const count = stepsRef.current.length;
    if (count <= 1) {
      setIsPlaying(false);
      return;
    }
    setCurrentStepIndex((prev) => {
      if (prev >= count - 1) return 0;
      return prev;
    });
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextStep = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [pause, totalSteps]);

  const prevStep = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, [pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const goToStep = useCallback((index: number) => {
    pause();
    const target = Math.max(0, Math.min(index, totalSteps - 1));
    setCurrentStepIndex(target);
  }, [pause, totalSteps]);

  // Handle auto-playback timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (totalSteps <= 1) {
      setIsPlaying(false);
      return;
    }

    const intervalMs = Math.round(1000 / speed);
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        if (next >= totalSteps - 1) {
          setIsPlaying(false);
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextStep, prevStep, reset]);

  return {
    currentStepIndex,
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    isAtStart,
    isAtEnd,
    play,
    playFromStart,
    pause,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    goToStep,
    setSpeed
  };
}
