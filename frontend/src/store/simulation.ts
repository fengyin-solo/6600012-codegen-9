import { create } from 'zustand'
import type { SimMode, SimulationParams, Particle, Tutorial, TutorialStep } from '../types'

const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c084fc','#f472b6','#38bdf8']

function randomParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number],
    velocity: [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    ] as [number, number, number],
    mass: 0.5 + Math.random() * 2,
    color: COLORS[i % COLORS.length],
    radius: 0.15 + Math.random() * 0.35,
  }))
}

interface TutorialState {
  activeTutorial: Tutorial | null
  currentStepIndex: number
  isAutoPlaying: boolean
  startTutorial: (tutorial: Tutorial) => void
  nextStep: () => void
  prevStep: () => void
  stopTutorial: () => void
  toggleAutoPlay: () => void
  getCurrentStep: () => TutorialStep | null
}

interface SimStore extends SimulationParams, TutorialState {
  particles: Particle[]
  fps: number
  totalEnergy: number
  setMode: (mode: SimMode) => void
  setParticleCount: (count: number) => void
  setParam: <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => void
  reset: () => void
  setFps: (fps: number) => void
  setTotalEnergy: (e: number) => void
  applyPreset: (preset: Partial<SimulationParams>) => void
}

export const useSimStore = create<SimStore>((set, get) => ({
  mode: 'gravity',
  particleCount: 300,
  gravity: 9.8,
  damping: 0.02,
  bounce: 0.7,
  attractorStrength: 5,
  slowMotion: false,
  paused: false,
  particles: randomParticles(300),
  fps: 0,
  totalEnergy: 0,

  activeTutorial: null,
  currentStepIndex: 0,
  isAutoPlaying: false,

  setMode: (mode) => set({ mode }),
  setParticleCount: (count) => set({ particleCount: count, particles: randomParticles(count) }),
  setParam: (key, value) => set({ [key]: value } as any),
  reset: () => {
    const { particleCount } = get()
    set({ particles: randomParticles(particleCount) })
  },
  setFps: (fps) => set({ fps }),
  setTotalEnergy: (e) => set({ totalEnergy: e }),
  applyPreset: (preset) => {
    set({ ...preset } as any)
    const { particleCount } = get()
    set({ particles: randomParticles(particleCount) })
  },

  startTutorial: (tutorial) => {
    const firstStep = tutorial.steps[0]
    if (firstStep?.params) {
      set({ ...firstStep.params } as any)
      if (firstStep.params.particleCount !== undefined) {
        set({ particles: randomParticles(firstStep.params.particleCount) })
      } else {
        set({ particles: randomParticles(get().particleCount) })
      }
    }
    set({ activeTutorial: tutorial, currentStepIndex: 0, isAutoPlaying: true })
  },

  nextStep: () => {
    const { activeTutorial, currentStepIndex } = get()
    if (!activeTutorial) return
    const nextIdx = currentStepIndex + 1
    if (nextIdx >= activeTutorial.steps.length) {
      set({ isAutoPlaying: false })
      return
    }
    const nextStep = activeTutorial.steps[nextIdx]
    if (nextStep?.params) {
      set({ ...nextStep.params } as any)
      if (nextStep.params.particleCount !== undefined) {
        set({ particles: randomParticles(nextStep.params.particleCount) })
      }
    }
    set({ currentStepIndex: nextIdx })
  },

  prevStep: () => {
    const { activeTutorial, currentStepIndex } = get()
    if (!activeTutorial) return
    const prevIdx = currentStepIndex - 1
    if (prevIdx < 0) return
    const prevStep = activeTutorial.steps[prevIdx]
    if (prevStep?.params) {
      set({ ...prevStep.params } as any)
      if (prevStep.params.particleCount !== undefined) {
        set({ particles: randomParticles(prevStep.params.particleCount) })
      }
    }
    set({ currentStepIndex: prevIdx })
  },

  stopTutorial: () => {
    set({ activeTutorial: null, currentStepIndex: 0, isAutoPlaying: false })
  },

  toggleAutoPlay: () => {
    set((s) => ({ isAutoPlaying: !s.isAutoPlaying }))
  },

  getCurrentStep: () => {
    const { activeTutorial, currentStepIndex } = get()
    if (!activeTutorial) return null
    return activeTutorial.steps[currentStepIndex] ?? null
  },
}))
