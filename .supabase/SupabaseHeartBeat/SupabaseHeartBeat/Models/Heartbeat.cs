using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace SupabaseHeartBeat.Models;

[Table("heartbeat")]
internal sealed class Heartbeat : BaseModel
{
    [PrimaryKey("id", false)]
    public int Id { get; set; }

    [Column("updated_at")]
    public DateTimeOffset PingedAt { get; set; }
}
