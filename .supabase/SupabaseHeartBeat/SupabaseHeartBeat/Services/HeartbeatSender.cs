using Supabase;
using SupabaseHeartBeat.Models;

namespace SupabaseHeartBeat.Services;

internal static class HeartbeatSender
{
    public static async Task<Heartbeat> SendAsync(Client supabase, string clientId)
    {
        Heartbeat heartbeat = new()
        {
            Id = string.IsNullOrWhiteSpace(clientId) ? Environment.MachineName : clientId.Trim(),
            PingedAt = DateTimeOffset.UtcNow
        };

        await supabase.From<Heartbeat>()
            .Upsert(heartbeat);

        Console.WriteLine($"Heartbeat sent for {heartbeat.Id} at {heartbeat.PingedAt:u}");

        return heartbeat;
    }
}
