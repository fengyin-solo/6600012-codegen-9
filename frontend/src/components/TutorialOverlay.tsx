import { useEffect, useRef } from 'react'
import { useSimStore } from '../store/simulation'

const PARAM_LABELS: Record<string, string> = {
  mode: '模拟模式',
  particleCount: '粒子数量',
  gravity: '重力',
  damping: '阻尼',
  bounce: '弹性系数',
  attractorStrength: '吸引力',
  slowMotion: '慢动作',
  paused: '暂停状态',
}

export default function TutorialOverlay() {
  const activeTutorial = useSimStore(s => s.activeTutorial)
  const currentStepIndex = useSimStore(s => s.currentStepIndex)
  const isAutoPlaying = useSimStore(s => s.isAutoPlaying)
  const getCurrentStep = useSimStore(s => s.getCurrentStep)
  const nextStep = useSimStore(s => s.nextStep)
  const prevStep = useSimStore(s => s.prevStep)
  const stopTutorial = useSimStore(s => s.stopTutorial)
  const toggleAutoPlay = useSimStore(s => s.toggleAutoPlay)

  const timerRef = useRef<number | null>(null)
  const step = getCurrentStep()

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (isAutoPlaying && step && step.duration) {
      timerRef.current = window.setTimeout(() => {
        nextStep()
      }, step.duration)
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [isAutoPlaying, step, currentStepIndex, nextStep])

  if (!activeTutorial || !step) return null

  const totalSteps = activeTutorial.steps.length
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-6 z-20">
      <div className="w-[640px] max-w-[90vw] pointer-events-auto">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeTutorial.icon}</span>
              <div>
                <div className="text-cyan-300 text-xs font-medium tracking-wide">教学演示</div>
                <div className="text-white text-sm font-bold">{activeTutorial.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-gray-300 text-sm font-mono">
                <span className="text-cyan-400">{currentStepIndex + 1}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span>{totalSteps}</span>
              </div>
              <button
                onClick={stopTutorial}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700/60 hover:bg-red-600/80 text-gray-300 hover:text-white transition-all"
                title="退出演示"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500 text-white text-sm font-bold">
                {currentStepIndex + 1}
              </span>
              {step.title}
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed mb-3">
              {step.description}
            </p>

            {step.highlightParams && step.highlightParams.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1.5">📌 当前关注参数</div>
                <div className="flex flex-wrap gap-1.5">
                  {step.highlightParams.map(p => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-medium"
                    >
                      {PARAM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-1 bg-gray-700/60 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isFirstStep
                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                ← 上一步
              </button>

              <button
                onClick={toggleAutoPlay}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg ${
                  isAutoPlaying
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/30'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30'
                }`}
              >
                {isAutoPlaying ? '⏸ 暂停' : '▶ 自动播放'}
              </button>

              <button
                onClick={nextStep}
                disabled={isLastStep && !isAutoPlaying}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLastStep
                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                下一步 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
