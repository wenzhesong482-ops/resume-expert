param(
  [ValidateSet('gui', 'start', 'stop')]
  [string]$Action = 'gui',
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $PSScriptRoot 'app.pid'
$LogFile = Join-Path $PSScriptRoot 'run.log'
$PageUrl = 'http://127.0.0.1:5173/'

function Test-PortListening([int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $client.Connect('127.0.0.1', $Port)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

function Get-SavedPid {
  if (-not (Test-Path $PidFile)) { return $null }
  $raw = (Get-Content -Path $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($raw -match '^\d+$') { return [int]$raw }
  return $null
}

function Test-ProcessAlive([int]$ProcessId) {
  return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Remove-PidFile {
  if (Test-Path $PidFile) { Remove-Item $PidFile -Force -ErrorAction SilentlyContinue }
}

function Stop-ProjectNodes {
  $marker = $Root
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains($marker) } |
    ForEach-Object {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-RunningApp {
  $saved = Get-SavedPid
  if ($saved -and (Test-ProcessAlive $saved)) {
    & taskkill.exe /PID $saved /T /F *> $null
  }
  Start-Sleep -Milliseconds 400
  Stop-ProjectNodes
  Remove-PidFile
}

function Get-BusyPorts {
  $busy = @()
  foreach ($port in 5173, 3001) {
    if (Test-PortListening $port) { $busy += $port }
  }
  return $busy
}

function Open-AppPage {
  Start-Process $PageUrl | Out-Null
}

function Wait-AppReady([System.Diagnostics.Process]$Process, [scriptblock]$OnTick) {
  for ($i = 0; $i -lt 80; $i++) {
    if ($script:cancelStart) { return $false }
    if ($Process.HasExited) { return $false }
    if ((Test-PortListening 5173) -and (Test-PortListening 3001)) { return $true }
    if ($OnTick) { & $OnTick }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Start-RunningApp([switch]$SkipBrowser) {
  $saved = Get-SavedPid
  if ($saved -and (Test-ProcessAlive $saved) -and (Test-PortListening 5173)) {
    if (-not $SkipBrowser) { Open-AppPage }
    return 'already'
  }

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    return 'no-node'
  }
  if (-not (Test-Path (Join-Path $Root 'node_modules'))) {
    return 'no-deps'
  }

  $busy = Get-BusyPorts
  if ($busy.Count -gt 0) {
    $script:busyPorts = ($busy -join '、')
    return 'busy'
  }

  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { return 'no-node' }
  if (Test-Path $LogFile) { Remove-Item $LogFile -Force -ErrorAction SilentlyContinue }

  $arg = '/c npm run dev:all > "' + $LogFile + '" 2>&1'
  $process = Start-Process -FilePath 'cmd.exe' -ArgumentList $arg -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  Set-Content -Path $PidFile -Value $process.Id -Encoding ascii

  $ready = Wait-AppReady $process {
    if ($script:statusLabel) {
      [System.Windows.Forms.Application]::DoEvents()
    }
  }

  if ($script:cancelStart) {
    Stop-RunningApp
    return 'cancelled'
  }

  if (-not $ready) {
    Stop-RunningApp
    return 'failed'
  }

  if (-not $SkipBrowser) { Open-AppPage }
  return 'started'
}

function Get-StartMessage([string]$Code) {
  switch ($Code) {
    'already' { return '已经在运行，已重新打开网页。' }
    'started' { return '已打开。' }
    'cancelled' { return '已取消。' }
    'no-node' { return '这台电脑还没有 Node.js，暂时不能开始。' }
    'no-deps' { return '还没有安装依赖。请先让 Agent 帮你安装，然后再点「开始」。' }
    'busy' { return "端口 $($script:busyPorts) 已被占用。请先关掉别的正在运行的程序，再点「开始」。" }
    default { return '没有打开成功。请先点「关闭」，再点一次「开始」。' }
  }
}

function Hide-ConsoleWindow {
  if (-not ('ConsoleHide' -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class ConsoleHide {
  [DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
  }
  $console = [ConsoleHide]::GetConsoleWindow()
  if ($console -ne [IntPtr]::Zero) {
    [ConsoleHide]::ShowWindow($console, 0) | Out-Null
  }
}

function Update-LauncherStatus {
  $running = $false
  $saved = Get-SavedPid
  if ($saved -and (Test-ProcessAlive $saved) -and (Test-PortListening 5173)) { $running = $true }
  if ($running) {
    $script:statusLabel.Text = '已打开'
  } else {
    $script:statusLabel.Text = '未打开'
  }
}

function Initialize-LauncherTheme {
  if ('ResumeAppleForm' -as [type]) { return }
  Add-Type -ReferencedAssemblies System.Windows.Forms, System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class ResumeUi {
  [DllImport("user32.dll")] public static extern bool ReleaseCapture();
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hWnd, int msg, int wParam, int lParam);
  [DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

  public static void Drag(IntPtr hwnd) {
    ReleaseCapture();
    SendMessage(hwnd, 0xA1, 2, 0);
  }

  public static void RoundWindow(IntPtr hwnd) {
    int pref = 2;
    DwmSetWindowAttribute(hwnd, 33, ref pref, 4);
  }

  public static void ApplyRound(Control control, int radius) {
    int d = radius * 2;
    Rectangle bounds = new Rectangle(0, 0, control.Width, control.Height);
    GraphicsPath path = new GraphicsPath();
    path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
    path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
    path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
    path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
    path.CloseFigure();
    control.Region = new Region(path);
    path.Dispose();
  }
}

public class ResumeAppleForm : Form {
  public int CornerRadius { get; set; }

  public ResumeAppleForm() {
    FormBorderStyle = FormBorderStyle.None;
    StartPosition = FormStartPosition.CenterScreen;
    BackColor = Color.White;
    DoubleBuffered = true;
    ShowInTaskbar = true;
    MaximizeBox = false;
    MinimizeBox = false;
    AutoScaleMode = AutoScaleMode.None;
    CornerRadius = 18;
  }

  protected override CreateParams CreateParams {
    get {
      CreateParams cp = base.CreateParams;
      cp.ClassStyle |= 0x00020000;
      return cp;
    }
  }

  protected override void OnHandleCreated(EventArgs e) {
    base.OnHandleCreated(e);
    ResumeUi.RoundWindow(Handle);
  }

  protected override void OnResize(EventArgs e) {
    base.OnResize(e);
    if (Width > 0 && Height > 0) ResumeUi.ApplyRound(this, CornerRadius);
  }

  protected override void OnMouseDown(MouseEventArgs e) {
    if (e.Button == MouseButtons.Left) ResumeUi.Drag(Handle);
    base.OnMouseDown(e);
  }
}

public class ResumeAppleButton : Button {
  public Color NormalColor { get; set; }
  public Color HoverColor { get; set; }
  public int CornerRadius { get; set; }
  private bool hover;

  public ResumeAppleButton() {
    SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true);
    FlatStyle = FlatStyle.Flat;
    FlatAppearance.BorderSize = 0;
    Cursor = Cursors.Hand;
    TabStop = false;
    NormalColor = Color.FromArgb(29, 29, 31);
    HoverColor = Color.Black;
    ForeColor = Color.White;
    CornerRadius = 12;
  }

  protected override void OnMouseEnter(EventArgs e) { hover = true; Invalidate(); base.OnMouseEnter(e); }
  protected override void OnMouseLeave(EventArgs e) { hover = false; Invalidate(); base.OnMouseLeave(e); }
  protected override void OnEnabledChanged(EventArgs e) { Invalidate(); base.OnEnabledChanged(e); }

  protected override void OnPaint(PaintEventArgs e) {
    Graphics g = e.Graphics;
    g.SmoothingMode = SmoothingMode.AntiAlias;
    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
    g.Clear(Parent == null ? Color.White : Parent.BackColor);
    Rectangle rect = new Rectangle(1, 1, Width - 3, Height - 3);
    Color fill = Enabled ? (hover ? HoverColor : NormalColor) : Color.FromArgb(242, 242, 247);
    Color ink = Enabled ? ForeColor : Color.FromArgb(142, 142, 147);
    using (GraphicsPath path = Round(rect, CornerRadius))
    using (SolidBrush brush = new SolidBrush(fill)) {
      g.FillPath(brush, path);
    }
    TextRenderer.DrawText(
      g, Text, Font, rect, ink,
      TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
  }

  static GraphicsPath Round(Rectangle r, int radius) {
    int d = radius * 2;
    GraphicsPath path = new GraphicsPath();
    path.AddArc(r.X, r.Y, d, d, 180, 90);
    path.AddArc(r.Right - d, r.Y, d, d, 270, 90);
    path.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
    path.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
    path.CloseFigure();
    return path;
  }
}
"@
}

function Enable-SharpText {
  if (-not ('ResumeDpi' -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class ResumeDpi {
  [DllImport("user32.dll")]
  public static extern bool SetProcessDpiAwarenessContext(IntPtr dpiContext);
  [DllImport("user32.dll")]
  public static extern uint GetDpiForSystem();
}
"@
  }
  [void][ResumeDpi]::SetProcessDpiAwarenessContext([IntPtr]::new(-4))
}

function Get-UiScale {
  $dpi = 96
  try { $dpi = [int][ResumeDpi]::GetDpiForSystem() } catch {}
  if ($dpi -lt 96) { $dpi = 96 }
  return ($dpi / 96.0)
}

function U([int]$value) {
  return [int][Math]::Round($value * $script:uiScale)
}

function New-AppleFont([string]$family, [single]$size) {
  return New-Object System.Drawing.Font(
    $family,
    $size,
    [System.Drawing.FontStyle]::Regular,
    [System.Drawing.GraphicsUnit]::Point
  )
}

function Show-LauncherWindow {
  Enable-SharpText
  $script:uiScale = Get-UiScale
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  [System.Windows.Forms.Application]::SetCompatibleTextRenderingDefault($false)
  Initialize-LauncherTheme

  $ink = [System.Drawing.Color]::FromArgb(29, 29, 31)
  $muted = [System.Drawing.Color]::FromArgb(110, 110, 115)
  $fill = [System.Drawing.Color]::FromArgb(245, 245, 247)

  $form = New-Object ResumeAppleForm
  $form.Text = '简历专家'
  $form.CornerRadius = (U 18)
  $form.ClientSize = New-Object System.Drawing.Size((U 440), (U 268))
  $form.Font = New-AppleFont 'Segoe UI' 12
  $form.AutoScaleMode = [System.Windows.Forms.AutoScaleMode]::None

  $close = New-Object System.Windows.Forms.Label
  $close.Text = '×'
  $close.Font = New-AppleFont 'Segoe UI' 14
  $close.ForeColor = $muted
  $close.AutoSize = $false
  $close.TextAlign = 'MiddleCenter'
  $close.Size = New-Object System.Drawing.Size((U 32), (U 32))
  $close.Location = New-Object System.Drawing.Point((U 392), (U 14))
  $close.Cursor = [System.Windows.Forms.Cursors]::Hand
  $close.BackColor = [System.Drawing.Color]::White
  $form.Controls.Add($close)
  $close.Add_MouseEnter({ $close.ForeColor = $ink })
  $close.Add_MouseLeave({ $close.ForeColor = $muted })
  $close.Add_Click({ $form.Close() })

  $title = New-Object System.Windows.Forms.Label
  $title.Text = '简历专家'
  $title.Font = New-AppleFont 'Segoe UI' 20
  $title.UseCompatibleTextRendering = $false
  $title.ForeColor = $ink
  $title.AutoSize = $true
  $title.BackColor = [System.Drawing.Color]::White
  $title.Location = New-Object System.Drawing.Point((U 32), (U 36))
  $form.Controls.Add($title)
  $title.Add_MouseDown({ if ($_.Button -eq 'Left') { [ResumeUi]::Drag($form.Handle) } })

  $hint = New-Object System.Windows.Forms.Label
  $hint.Text = "开始后会打开浏览器。`r`n关闭窗口也会停下。"
  $hint.Font = New-AppleFont 'Segoe UI' 11
  $hint.UseCompatibleTextRendering = $false
  $hint.ForeColor = $muted
  $hint.BackColor = [System.Drawing.Color]::White
  $hint.Size = New-Object System.Drawing.Size((U 360), (U 56))
  $hint.Location = New-Object System.Drawing.Point((U 32), (U 84))
  $form.Controls.Add($hint)
  $hint.Add_MouseDown({ if ($_.Button -eq 'Left') { [ResumeUi]::Drag($form.Handle) } })

  $startBtn = New-Object ResumeAppleButton
  $startBtn.Text = '开始'
  $startBtn.Font = New-AppleFont 'Segoe UI' 12
  $startBtn.CornerRadius = (U 12)
  $startBtn.Size = New-Object System.Drawing.Size((U 182), (U 44))
  $startBtn.Location = New-Object System.Drawing.Point((U 32), (U 156))
  $startBtn.NormalColor = $ink
  $startBtn.HoverColor = [System.Drawing.Color]::Black
  $startBtn.ForeColor = [System.Drawing.Color]::White
  $form.Controls.Add($startBtn)

  $stopBtn = New-Object ResumeAppleButton
  $stopBtn.Text = '关闭'
  $stopBtn.Font = New-AppleFont 'Segoe UI' 12
  $stopBtn.CornerRadius = (U 12)
  $stopBtn.Size = New-Object System.Drawing.Size((U 182), (U 44))
  $stopBtn.Location = New-Object System.Drawing.Point((U 226), (U 156))
  $stopBtn.NormalColor = $fill
  $stopBtn.HoverColor = [System.Drawing.Color]::FromArgb(232, 232, 237)
  $stopBtn.ForeColor = $ink
  $form.Controls.Add($stopBtn)

  $script:statusLabel = New-Object System.Windows.Forms.Label
  $script:statusLabel.AutoSize = $false
  $script:statusLabel.Font = New-AppleFont 'Segoe UI' 11
  $script:statusLabel.UseCompatibleTextRendering = $false
  $script:statusLabel.Size = New-Object System.Drawing.Size((U 376), (U 28))
  $script:statusLabel.Location = New-Object System.Drawing.Point((U 32), (U 216))
  $script:statusLabel.ForeColor = $muted
  $script:statusLabel.BackColor = [System.Drawing.Color]::White
  $form.Controls.Add($script:statusLabel)
  $script:statusLabel.Add_MouseDown({ if ($_.Button -eq 'Left') { [ResumeUi]::Drag($form.Handle) } })

  $startBtn.Add_Click({
    try {
      $script:cancelStart = $false
      $startBtn.Text = '打开中'
      $startBtn.Enabled = $false
      $script:statusLabel.Text = '正在打开…'
      [System.Windows.Forms.Application]::DoEvents()
      $code = Start-RunningApp
      $script:statusLabel.Text = (Get-StartMessage $code)
      if ($code -eq 'failed' -or $code -eq 'busy' -or $code -eq 'no-node' -or $code -eq 'no-deps') {
        [System.Windows.Forms.MessageBox]::Show((Get-StartMessage $code), '简历专家') | Out-Null
      }
      if ($code -eq 'started' -or $code -eq 'already') {
        $script:statusLabel.Text = '已打开'
      }
    } catch {
      $script:statusLabel.Text = $_.Exception.Message
      [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, '简历专家') | Out-Null
    } finally {
      $startBtn.Text = '开始'
      $startBtn.Enabled = $true
      if ($script:statusLabel.Text -eq '正在打开…') {
        Update-LauncherStatus
      }
    }
  })

  $stopBtn.Add_Click({
    try {
      $script:cancelStart = $true
      $stopBtn.Enabled = $false
      $script:statusLabel.Text = '正在关闭…'
      [System.Windows.Forms.Application]::DoEvents()
      Stop-RunningApp
      Update-LauncherStatus
    } catch {
      $script:statusLabel.Text = $_.Exception.Message
      [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, '简历专家') | Out-Null
    } finally {
      $stopBtn.Enabled = $true
    }
  })

  $form.Add_FormClosing({
    $script:cancelStart = $true
    Stop-RunningApp
  })

  $form.Add_Shown({
    $form.Activate() | Out-Null
    Hide-ConsoleWindow
    if ($env:LAUNCHER_PREVIEW -eq '1') {
      $form.Refresh()
      $bmp = New-Object System.Drawing.Bitmap $form.Width, $form.Height
      $form.DrawToBitmap($bmp, (New-Object System.Drawing.Rectangle 0, 0, $form.Width, $form.Height))
      $out = Join-Path $PSScriptRoot 'window-preview.png'
      $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
      $bmp.Dispose()
      $form.Close()
    }
  })

  Update-LauncherStatus
  [void]$form.ShowDialog()
}

switch ($Action) {
  'start' {
    $script:cancelStart = $false
    $code = Start-RunningApp -SkipBrowser:$NoBrowser
    Write-Output $code
    if ($code -ne 'started' -and $code -ne 'already') { exit 1 }
  }
  'stop' {
    Stop-RunningApp
    Write-Output 'stopped'
  }
  default { Show-LauncherWindow }
}
