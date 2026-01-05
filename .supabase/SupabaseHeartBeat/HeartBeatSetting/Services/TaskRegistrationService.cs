using Microsoft.Win32.TaskScheduler;
using System.IO;

namespace HeartBeatSetting.Services;

internal static class TaskRegistrationService
{
    private const string DefaultTaskName = "SupabaseHeartbeat";

    public static void CreateOrUpdate(string exePath, string? workingDirectory, TimeSpan? dailyTime, bool addLogonTrigger)
    {
        if (string.IsNullOrWhiteSpace(exePath) || !File.Exists(exePath))
        {
            throw new FileNotFoundException("ハートビート実行ファイルが見つかりません。", exePath);
        }

        using TaskService ts = new();
        TaskDefinition td = ts.NewTask();
        td.RegistrationInfo.Description = "Supabase heartbeat + dummy storage upload";

        if (dailyTime.HasValue)
        {
            DateTime start = DateTime.Today.Add(dailyTime.Value);
            if (start <= DateTime.Now)
            {
                start = start.AddDays(1);
            }

            DailyTrigger daily = new()
            {
                StartBoundary = start
            };
            td.Triggers.Add(daily);
        }

        if (addLogonTrigger)
        {
            td.Triggers.Add(new LogonTrigger());
        }

        td.Actions.Add(new ExecAction(exePath, null, workingDirectory));

        td.Settings.StopIfGoingOnBatteries = false;
        td.Settings.DisallowStartIfOnBatteries = false;
        td.Settings.MultipleInstances = TaskInstancesPolicy.IgnoreNew;

        ts.RootFolder.RegisterTaskDefinition(DefaultTaskName, td, TaskCreation.CreateOrUpdate, null, null, TaskLogonType.InteractiveToken);
    }

    public static void Delete()
    {
        using TaskService ts = new();
        try
        {
            ts.RootFolder.DeleteTask(DefaultTaskName, false);
        }
        catch (FileNotFoundException)
        {
            // タスクがない場合は無視
        }
    }
}
