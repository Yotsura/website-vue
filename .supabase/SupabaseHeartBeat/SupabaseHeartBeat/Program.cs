using Supabase;
using SupabaseHeartBeat;
using SupabaseHeartBeat.Config;
using SupabaseHeartBeat.Models;
using SupabaseHeartBeat.Services;

SupabaseConfig config = await ConfigLoader.LoadAsync(AppDefaults.ConfigFileName);
if (config == null)
    throw new($"設定ファイルが見つかりません。：{AppDefaults.ConfigFileName}");

SupabaseOptions options = new()
{
    AutoConnectRealtime = false
};

Client supabase = new(config.Url ?? throw new($"設定ファイルにURLが設定されていません。：{AppDefaults.ConfigFileName}"), config.Key, options);
try
{
    await supabase.InitializeAsync();

    StateStore stateStore = new(AppDefaults.StateFileName);
    HeartbeatState state = await stateStore.LoadAsync();

    DateOnly todayLocal = DateOnly.FromDateTime(DateTime.Now);
    if (state.LastRunDateLocal is DateOnly last && last == todayLocal)
    {
        Console.WriteLine("今日のハートビートは実行済みのためスキップします。");
        return;
    }

    Heartbeat heartbeat = await HeartbeatSender.SendAsync(supabase, config.ClientId ?? Environment.MachineName);

    string objectPath = await DummyStorageCycler.RunAsync(supabase, config, state);

    state.LastObjectPath = objectPath;
    state.LastRunDateLocal = todayLocal;
    await stateStore.SaveAsync(state);
}
finally
{
    if (supabase is IDisposable disposable)
    {
        disposable.Dispose();
    }
}