namespace SupabaseHeartBeat.Models;

internal sealed class HeartbeatState
{
    public string? LastObjectPath { get; set; }
    public DateOnly? LastRunDateLocal { get; set; }
}
