using System.IO;
using System.Text.Json;
using SupabaseHeartBeat;
using SupabaseHeartBeat.Config;

namespace HeartBeatSetting.Services;

internal static class ConfigFileService
{
    public static async Task<SupabaseConfig?> LoadAsync(string directory)
    {
        string path = Path.Combine(directory, AppDefaults.ConfigFileName);
        if (!File.Exists(path))
        {
            return null;
        }

        await using FileStream stream = File.OpenRead(path);
        SupabaseConfig? config = await JsonSerializer.DeserializeAsync<SupabaseConfig>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        });

        return config;
    }

    public static async Task SaveAsync(string directory, SupabaseConfig config)
    {
        Directory.CreateDirectory(directory);
        string path = Path.Combine(directory, AppDefaults.ConfigFileName);
        JsonSerializerOptions options = new() { WriteIndented = true };

        await using FileStream stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, config, options);
    }
}
