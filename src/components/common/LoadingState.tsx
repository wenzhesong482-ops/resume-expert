interface LoadingStateProps {
  message?: string
}

// 加载状态：不定式进度条（与 ProgressBar 同款细轨道），不使用转圈动画。
export default function LoadingState({ message = '正在调用 AI 分析，请稍候…' }: LoadingStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 py-16">
      <p className="text-sm text-gray-500">{message}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-1/3 rounded-full bg-gray-700 animate-indeterminate" />
      </div>
      <p className="text-xs text-gray-400">真实 AI 调用约需 60–90 秒，请耐心等待，期间勿刷新页面</p>
    </div>
  )
}
