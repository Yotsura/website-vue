using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.CompilerServices;
using HeartBeatSetting.Services;
using HeartBeatSetting.Utilities;
using SupabaseHeartBeat;
using SupabaseHeartBeat.Config;

namespace HeartBeatSetting.ViewModels;

internal sealed class MainViewModel : INotifyPropertyChanged
{
    private string _url = string.Empty;
    private string _key = string.Empty;
    private string _clientId = string.Empty;
    private string _bucket = AppDefaults.Bucket;
    private string _objectPrefix = AppDefaults.ObjectPrefix;
    private string _heartbeatExePath = string.Empty;
    private string _workingDirectory = AppContext.BaseDirectory;
    private string _dailyTimeText = "00:00";
    private bool _addLogonTrigger = true;
    private string _statusMessage = string.Empty;

    public string Url { get => _url; set { _url = value; OnPropertyChanged(); } }
    public string Key { get => _key; set { _key = value; OnPropertyChanged(); } }
    public string ClientId { get => _clientId; set { _clientId = value; OnPropertyChanged(); } }
    public string Bucket { get => _bucket; set { _bucket = value; OnPropertyChanged(); } }
    public string ObjectPrefix { get => _objectPrefix; set { _objectPrefix = value; OnPropertyChanged(); } }

    public string HeartbeatExePath { get => _heartbeatExePath; set { _heartbeatExePath = value; OnPropertyChanged(); } }
    public string WorkingDirectory { get => _workingDirectory; set { _workingDirectory = value; OnPropertyChanged(); } }
    public string DailyTimeText { get => _dailyTimeText; set { _dailyTimeText = value; OnPropertyChanged(); } }
    public bool AddLogonTrigger { get => _addLogonTrigger; set { _addLogonTrigger = value; OnPropertyChanged(); } }
    public string StatusMessage { get => _statusMessage; set { _statusMessage = value; OnPropertyChanged(); } }

    public RelayCommand LoadCommand { get; }
    public RelayCommand SaveCommand { get; }
    public RelayCommand RegisterTaskCommand { get; }
    public RelayCommand DeleteTaskCommand { get; }
    public RelayCommand RunHeartbeatCommand { get; }

    public MainViewModel()
    {
        LoadCommand = new RelayCommand(async _ => await LoadAsync());
        SaveCommand = new RelayCommand(async _ => await SaveAsync());
        RegisterTaskCommand = new RelayCommand(_ => RegisterTask());
        DeleteTaskCommand = new RelayCommand(_ => DeleteTask());
        RunHeartbeatCommand = new RelayCommand(async _ => await RunHeartbeatAsync());

        // デフォルトでハートビート exe を同階層に想定
        string defaultExe = Path.Combine(AppContext.BaseDirectory, "SupabaseHeartBeat.exe");
        if (File.Exists(defaultExe))
        {
            HeartbeatExePath = defaultExe;
            WorkingDirectory = AppContext.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        }

        // 起動時に設定があれば読み込む（非同期 fire-and-forget）
        _ = LoadAsync();
    }

    private async Task LoadAsync()
    {
        try
        {
            StatusMessage = "設定読込中...";
            SupabaseConfig? config = await ConfigFileService.LoadAsync(WorkingDirectory);
            if (config == null)
            {
                StatusMessage = "設定ファイルが見つかりません。";
                return;
            }

            Url = config.Url ?? string.Empty;
            Key = config.Key ?? string.Empty;
            ClientId = config.ClientId?.ToString() ?? string.Empty;
            Bucket = config.Bucket ?? AppDefaults.Bucket;
            ObjectPrefix = config.ObjectPrefix ?? AppDefaults.ObjectPrefix;

            StatusMessage = "設定を読み込みました。";
        }
        catch (Exception ex)
        {
            StatusMessage = $"設定読込に失敗しました: {ex.Message}";
        }
    }

    private async Task SaveAsync()
    {
        try
        {
            StatusMessage = "設定保存中...";

            if (!int.TryParse(ClientId, out int clientId))
            {
                throw new FormatException("ClientId は整数で入力してください。");
            }

            SupabaseConfig config = new()
            {
                Url = Url,
                Key = Key,
                ClientId = clientId,
                Bucket = string.IsNullOrWhiteSpace(Bucket) ? AppDefaults.Bucket : Bucket,
                ObjectPrefix = string.IsNullOrWhiteSpace(ObjectPrefix) ? AppDefaults.ObjectPrefix : ObjectPrefix
            };

            await ConfigFileService.SaveAsync(WorkingDirectory, config);
            StatusMessage = "設定を保存しました。";
        }
        catch (Exception ex)
        {
            StatusMessage = $"設定保存に失敗しました: {ex.Message}";
        }
    }

    private async Task RunHeartbeatAsync()
    {
        try
        {
            if (string.IsNullOrWhiteSpace(HeartbeatExePath) || !File.Exists(HeartbeatExePath))
            {
                StatusMessage = "Heartbeat exe が見つかりません。";
                return;
            }

            string workingDir = Directory.Exists(WorkingDirectory)
                ? WorkingDirectory
                : Path.GetDirectoryName(HeartbeatExePath) ?? AppContext.BaseDirectory;

            StatusMessage = "Heartbeat 実行中...";

            ProcessStartInfo psi = new()
            {
                FileName = HeartbeatExePath,
                WorkingDirectory = workingDir,
                UseShellExecute = false
            };

            using Process? process = Process.Start(psi);
            if (process is null)
            {
                StatusMessage = "Heartbeat の起動に失敗しました。";
                return;
            }

            await process.WaitForExitAsync();
            StatusMessage = process.ExitCode == 0
                ? "Heartbeat を実行しました。"
                : $"Heartbeat 実行に失敗しました (ExitCode: {process.ExitCode})";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Heartbeat 実行エラー: {ex.Message}";
        }
    }

    private void RegisterTask()
    {
        try
        {
            TimeSpan? daily = ParseDailyTime(DailyTimeText);
            TaskRegistrationService.CreateOrUpdate(HeartbeatExePath, WorkingDirectory, daily, AddLogonTrigger);
            StatusMessage = "タスクを登録/更新しました。";
        }
        catch (Exception ex)
        {
            StatusMessage = $"タスク登録に失敗しました: {ex.Message}";
        }
    }

    private void DeleteTask()
    {
        try
        {
            TaskRegistrationService.Delete();
            StatusMessage = "タスクを削除しました。";
        }
        catch (Exception ex)
        {
            StatusMessage = $"タスク削除に失敗しました: {ex.Message}";
        }
    }

    private static TimeSpan? ParseDailyTime(string text)
        => string.IsNullOrWhiteSpace(text) ? null :
            TimeSpan.TryParse(text, out TimeSpan ts) ? ts :
            throw new FormatException("毎日実行時刻は HH:mm 形式で入力してください。");

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
