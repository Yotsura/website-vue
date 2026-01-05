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

    Heartbeat heartbeat = await HeartbeatSender.SendAsync(supabase, config.ClientId ?? Environment.MachineName);

    StateStore stateStore = new(AppDefaults.StateFileName);
    HeartbeatState state = await stateStore.LoadAsync();

    string objectPath = await DummyStorageCycler.RunAsync(supabase, config, state);

    state.LastObjectPath = objectPath;
    await stateStore.SaveAsync(state);
}
finally
{
    if (supabase is IDisposable disposable)
    {
        disposable.Dispose();
    }
}