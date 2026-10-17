import { useState } from 'react'
import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeResponse,
  EvaluateInterviewAnswerResponse
} from './types'
import { analyzeInitial, createCostChainId, optimizeResume } from './services/api'
import { validateInput } from './utils/validators'
import { buildMarkdown, downloadMarkdown } from './utils/exportMarkdown'
import AppLayout from './components/layout/AppLayout'
import TopNav, { STEPS } from './components/layout/TopNav'
import Sidebar from './components/layout/Sidebar'
import LoadingState from './components/common/LoadingState'
import ErrorState from './components/common/ErrorState'
import InputMaterials from './components/workflow/InputMaterials'
import JDAnalysisView from './components/workflow/JDAnalysis'
import ResumeDiagnosisView from './components/workflow/ResumeDiagnosis'
import MatchAnalysis from './components/workflow/MatchAnalysis'
import FollowUpQuestions from './components/workflow/FollowUpQuestions'
import ResumeStrategyView from './components/workflow/ResumeStrategy'
import RewriteComparison from './components/workflow/RewriteComparison'
import FinalResumeView from './components/workflow/FinalResume'
import InterviewAndFurther from './components/workflow/InterviewAndFurther'
import MockInterview from './components/workflow/MockInterview'

const EMPTY_INPUT: AnalyzeInitialRequest = {
  targetRole: '',
  targetIndustry: '',
  targetCompanyType: '',
  targetApplicationScenario: '',
  graduationStage: '',
  educationLevel: '',
  major: '',
  highlightAbilities: '',
  jdText: '',
  resumeText: '',
  internshipExperience: '',
  projectExperience: '',
  campusExperience: '',
  researchExperience: '',
  competitionExperience: '',
  skillsAndCertificates: '',
  measurableResults: '',
  avoidExaggeration: '',
  resumeLength: '一页'
}

type Phase = 'initial' | 'optimize'

export default function App() {
  const [input, setInput] = useState<AnalyzeInitialRequest>(EMPTY_INPUT)
  const [initial, setInitial] = useState<AnalyzeInitialResponse | null>(null)
  const [optimize, setOptimize] = useState<OptimizeResumeResponse | null>(null)
  const [followUpAnswers, setFollowUpAnswers] = useState('')
  const [mockAnswers, setMockAnswers] = useState<Record<string, string>>({})
  const [mockEvaluations, setMockEvaluations] = useState<Record<string, EvaluateInterviewAnswerResponse>>({})

  const [loadingPhase, setLoadingPhase] = useState<Phase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorPhase, setErrorPhase] = useState<Phase | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  const [activeStep, setActiveStep] = useState(-1)
  const [maxReached, setMaxReached] = useState(0) // 可达步骤数
  const [costChainId, setCostChainId] = useState('')

  const patchInput = (patch: Partial<AnalyzeInitialRequest>) => {
    setInput((prev) => ({ ...prev, ...patch }))
    setInputError(null)
  }

  async function handleAnalyze() {
    const verr = validateInput(input)
    if (verr) {
      setInputError(verr)
      return
    }
    setLoadingPhase('initial')
    setError(null)
    setErrorPhase(null)
    const chainId = createCostChainId()
    setCostChainId(chainId)
    try {
      const res = await analyzeInitial(input, chainId)
      setInitial(res.data)
      setOptimize(null)
      setMockAnswers({})
      setMockEvaluations({})
      setMaxReached(5) // 步骤 0-4 可达（校招JD解析→优化策略）
      setActiveStep(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '初始分析失败，请重试。')
      setErrorPhase('initial')
    } finally {
      setLoadingPhase(null)
    }
  }

  async function handleOptimize() {
    if (!initial) return
    setLoadingPhase('optimize')
    setError(null)
    setErrorPhase(null)
    try {
      const res = await optimizeResume(
        {
          originalInput: input,
          initialAnalysis: initial,
          followUpAnswers
        },
        costChainId || createCostChainId()
      )
      setOptimize(res.data)
      setMaxReached(STEPS.length) // 全部步骤可达
      setActiveStep(5)
    } catch (e) {
      setError(e instanceof Error ? e.message : '深度优化失败，请重试。')
      setErrorPhase('optimize')
    } finally {
      setLoadingPhase(null)
    }
  }

  function handleExport() {
    if (!initial || !optimize) return
    const md = buildMarkdown(input, initial, optimize, mockEvaluations)
    const name = `${input.targetRole || '应届生简历'}-校招优化报告.md`
    downloadMarkdown(name, md)
  }

  function renderRightPanel() {
    if (loadingPhase === 'initial') return <LoadingState message="正在调用 AI 进行校招初始分析…" />
    if (loadingPhase === 'optimize') return <LoadingState message="正在调用 AI 进行深度优化…" />

    if (error && errorPhase) {
      const retry = errorPhase === 'initial' ? handleAnalyze : handleOptimize
      return <ErrorState message={error} onRetry={retry} />
    }

    if (!initial) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-base font-medium text-gray-400">尚未生成分析结果</p>
          <p className="text-sm text-gray-400">请在左侧填写应届生求职材料并点击「开始分析」。</p>
        </div>
      )
    }

    switch (activeStep) {
      case 0:
        return <JDAnalysisView data={initial.jdAnalysis} requirementLevels={initial.jdRequirementLevels} />
      case 1:
        return (
          <ResumeDiagnosisView
            data={initial.resumeDiagnosis}
            roleFit={initial.roleFitAssessment}
            noReply={initial.noReplyDiagnosis}
          />
        )
      case 2:
        return <MatchAnalysis data={initial.matchTable} />
      case 3:
        return (
          <FollowUpQuestions
            data={initial.followUpQuestions}
            answers={followUpAnswers}
            onAnswersChange={setFollowUpAnswers}
            onOptimize={handleOptimize}
            loading={loadingPhase === 'optimize'}
          />
        )
      case 4:
        return (
          <ResumeStrategyView
            data={initial.resumeStrategy}
            transferability={initial.experienceTransferability}
          />
        )
      case 5:
        return optimize ? <RewriteComparison data={optimize.rewriteComparison} /> : null
      case 6:
        return optimize ? (
          <FinalResumeView
            data={optimize.finalResume}
            assessment={optimize.finalAssessment}
            initialFitScore={initial.roleFitAssessment.fitScore}
            initialMatchScore={initial.resumeDiagnosis.matchScore}
          />
        ) : null
      case 7:
        return optimize ? (
          <InterviewAndFurther
            interviewRisks={optimize.interviewRisks}
            further={optimize.furtherSuggestions}
            skillGap={initial.skillGapPlan}
            onExport={handleExport}
          />
        ) : null
      case 8:
        return optimize ? (
          <MockInterview
            plan={optimize.mockInterviewPlan}
            originalInput={input}
            initialAnalysis={initial}
            optimizedResult={optimize}
            answers={mockAnswers}
            onAnswerChange={(id, text) => setMockAnswers((p) => ({ ...p, [id]: text }))}
            evaluations={mockEvaluations}
            onEvaluated={(id, result) => setMockEvaluations((p) => ({ ...p, [id]: result }))}
            onExport={handleExport}
            costChainId={costChainId}
          />
        ) : null
      default:
        return null
    }
  }

  const stepLabel = activeStep >= 0 ? STEPS[activeStep]?.label : ''

  return (
    <AppLayout>
      <TopNav activeIndex={activeStep} maxReachedIndex={maxReached} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          <InputMaterials
            value={input}
            onChange={patchInput}
            onAnalyze={handleAnalyze}
            loading={loadingPhase === 'initial'}
          />
          {inputError && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{inputError}</p>
          )}
        </Sidebar>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {stepLabel || '结果展示区'}
            </h2>
          </div>
          <div className="p-6">{renderRightPanel()}</div>

          {initial && !loadingPhase && !error && (
            <StepPager activeStep={activeStep} maxReached={maxReached} onChange={setActiveStep} />
          )}
        </div>
      </div>
    </AppLayout>
  )
}

// 步骤翻页器
function StepPager({
  activeStep,
  maxReached,
  onChange
}: {
  activeStep: number
  maxReached: number
  onChange: (i: number) => void
}) {
  if (activeStep < 0) return null
  const prev = activeStep > 0 ? activeStep - 1 : -1
  const next = activeStep < maxReached - 1 ? activeStep + 1 : -1
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
      <button
        disabled={prev < 0}
        onClick={() => prev >= 0 && onChange(prev)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        ← 上一步
      </button>
      <span className="text-xs text-gray-400">
        {activeStep + 1} / {maxReached}
      </span>
      <button
        disabled={next < 0 || next >= maxReached}
        onClick={() => next >= 0 && next < maxReached && onChange(next)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        下一步 →
      </button>
    </div>
  )
}
