#version 450
layout (triangles) in;
layout (line_strip, max_vertices = 2) out;

layout(push_constant) uniform params_t {
    mat4 mProjView;
} params;

layout (location = 0) in VS_IN
{
    vec3 wPos;
    vec3 wNorm;
    vec3 wTangent;
    vec2 texCoord;
    vec3 color;
} gs_in[];

vec4 Explode(vec4 position, vec3 normal) {
    float magnitude = 0.05;
    vec3 direction = normal * magnitude; 
    return position + vec4(direction, 0.0);
} 

vec3 GetNormal() {
   vec3 a = vec3(gs_in[2].wPos) - vec3(gs_in[1].wPos);
   vec3 b = vec3(gs_in[0].wPos) - vec3(gs_in[1].wPos);
   return normalize(cross(a, b));
}

vec4 GetMiddle() {
    return vec4((vec3(gs_in[0].wPos) + vec3(gs_in[1].wPos) + vec3(gs_in[2].wPos)) / 3.0, 1.0f);
}

void main() {    
    gl_Position = params.mProjView * GetMiddle();
    EmitVertex();

    gl_Position = params.mProjView * Explode(GetMiddle(), GetNormal());
    EmitVertex();

    EndPrimitive();
}