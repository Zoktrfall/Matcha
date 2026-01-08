namespace server.Models;

public record UpdateProfileRequest(string Gender, string Preference, string Bio);
public record AttachTagsRequest(string[] Tags);
public record DetachTagRequest(string Tag);
