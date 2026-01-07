namespace SupabaseHeartBeat.Config;

public sealed class SupabaseConfig
{
    public string? Url { get; set; }
    public string? Key { get; set; }
    public int? ClientId { get; set; }
    public string? Bucket { get; set; }
    public string? ObjectPrefix { get; set; }
}
