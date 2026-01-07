using System.Text.Json;

namespace SupabaseHeartBeat.Config;

internal static class ConfigLoader
{
    public static async Task<SupabaseConfig> LoadAsync(string fileName)
    {
        string configPath = Path.Combine(AppContext.BaseDirectory, fileName);
        SupabaseConfig? config = null;

        if (File.Exists(configPath))
        {
            await using FileStream stream = File.OpenRead(configPath);
            config = await JsonSerializer.DeserializeAsync<SupabaseConfig>(stream, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                ReadCommentHandling = JsonCommentHandling.Skip,
                AllowTrailingCommas = true
            });
        }

        config ??= new SupabaseConfig
        {
            Url = Environment.GetEnvironmentVariable("SUPABASE_URL"),
            Key = Environment.GetEnvironmentVariable("SUPABASE_KEY"),
            ClientId = ParseInt(Environment.GetEnvironmentVariable("SUPABASE_CLIENT_ID")),
            Bucket = AppDefaults.Bucket,
            ObjectPrefix = AppDefaults.ObjectPrefix
        };

        if (string.IsNullOrWhiteSpace(config.Url) || string.IsNullOrWhiteSpace(config.Key))
        {
            throw new InvalidOperationException("Supabase URL/Key not found in JSON config or environment variables.");
        }

        config.Bucket = Normalize(config.Bucket, AppDefaults.Bucket);
        config.ObjectPrefix = Normalize(config.ObjectPrefix, AppDefaults.ObjectPrefix);

        return config;
    }

    private static string Normalize(string? value, string fallback)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }

        return value.Trim('/');
    }

    private static int? ParseInt(string? value)
    {
        if (int.TryParse(value, out int parsed))
        {
            return parsed;
        }

        return null;
    }
}
