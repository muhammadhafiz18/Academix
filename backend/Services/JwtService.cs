using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace EduPressApi.Services
{
    public interface IJwtService
    {
        Task<ClaimsPrincipal?> ValidateTokenAsync(string token);
        string? GetUserIdFromToken(string token);
    }

    public class JwtService : IJwtService
    {
        private readonly string _jwtSecret;

        public JwtService()
        {
            _jwtSecret = Environment.GetEnvironmentVariable("SUPABASE_JWT_SECRET") 
                ?? throw new InvalidOperationException("SUPABASE_JWT_SECRET is not configured");
        }

        public async Task<ClaimsPrincipal?> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtSecret);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false, // Supabase handles this
                    ValidateAudience = false, // Supabase handles this
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(5)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public string? GetUserIdFromToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);
                
                return jsonToken.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}
