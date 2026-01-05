using Supabase;
using SupabaseHeartBeat;
using SupabaseHeartBeat.Config;
using SupabaseHeartBeat.Models;
using SupabaseHeartBeat.Utilities;

namespace SupabaseHeartBeat.Services;

internal static class DummyStorageCycler
{
    public static async Task<string> RunAsync(Client supabase, SupabaseConfig config, HeartbeatState state)
    {
        string bucket = string.IsNullOrWhiteSpace(config.Bucket) ? AppDefaults.Bucket : config.Bucket.Trim();
        string objectPrefix = string.IsNullOrWhiteSpace(config.ObjectPrefix) ? AppDefaults.ObjectPrefix : config.ObjectPrefix.Trim('/');

        if (!string.IsNullOrWhiteSpace(state.LastObjectPath))
        {
            await supabase.Storage
                .From(bucket)
                .Remove(new List<string> { state.LastObjectPath });

            Console.WriteLine($"Removed previous dummy object: {state.LastObjectPath}");
        }

        string objectPath = $"{objectPrefix}/{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}.png";

        await supabase.Storage
            .From(bucket)
            .Upload(DummyImage.PngBytes, objectPath, options: null, onProgress: null, inferContentType: true);

        Console.WriteLine($"Uploaded dummy object: {objectPath}");

        return objectPath;
    }
}
