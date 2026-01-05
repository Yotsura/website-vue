using System.Text.Json;
using SupabaseHeartBeat.Models;

namespace SupabaseHeartBeat.Services;

internal sealed class StateStore
{
    private readonly string _filePath;

    public StateStore(string fileName)
    {
        _filePath = Path.Combine(AppContext.BaseDirectory, fileName);
    }

    public async Task<HeartbeatState> LoadAsync()
    {
        if (!File.Exists(_filePath))
        {
            return new HeartbeatState();
        }

        await using FileStream stream = File.OpenRead(_filePath);
        HeartbeatState? state = await JsonSerializer.DeserializeAsync<HeartbeatState>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        });

        return state ?? new HeartbeatState();
    }

    public async Task SaveAsync(HeartbeatState state)
    {
        JsonSerializerOptions options = new() { WriteIndented = true };

        await using FileStream stream = File.Create(_filePath);
        await JsonSerializer.SerializeAsync(stream, state, options);
    }
}
