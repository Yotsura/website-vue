using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SupabaseHeartBeat.Models;

[Table("heartbeats")]
internal sealed class Heartbeat : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;

    [Column("pinged_at")]
    public DateTimeOffset PingedAt { get; set; }
}
