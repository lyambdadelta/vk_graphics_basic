#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) out vec4 color;

layout (binding = 0) uniform sampler2D colorTex;

layout (location = 0 ) in VS_OUT {
  vec2 texCoord;
} surf;

vec4 BilateralFilter(const sampler2D colorTex, const vec2 tex) {
  vec4 oldColor = textureLod(colorTex, surf.texCoord, 0);

  const float k1 = 0.05; // 1/2sigma**2
  const float k2 = 80;  // 1/2h**2

  const int window = 4;
  ivec2 sz = textureSize(colorTex, 0);
  float dx = 1.0/float(sz.x);
  float dy = 1.0/float(sz.y);
  vec4 clr = vec4(0.0);
  float sum = 0.0;
  // Gaussian: k(i,j) = exp(-(i**2 + j**2)/sigma**2)exp(-ClrSpaceDist(i,j)/h**2)
  // ClrSpaceDist - photometric distance
  // W(y) = exp(-abs(y-c)**2/r**2) * exp(-abs(u(y)-u(c))**2/h**2)

  for (int i = -window; i <= window; i++) {
    for (int j = -window; j <= window; j++) {
      vec4 shiftColor = texture(colorTex, tex + vec2(i * dx, j * dy));
      float dist = length(vec2(i, j));
      float clrDist = length(shiftColor - oldColor);
      float weight = exp (-(k1 * dist * dist + k2 * clrDist * clrDist));

      clr += weight * shiftColor;
      sum += weight;
    }
  }
  color = clr / sum;
	return color;
}

void main() {
  // color = textureLod(colorTex, surf.texCoord, 0);
  // color = vec4( ivec4( color * 8 + vec4(0.5))) / 8;
  color = BilateralFilter(colorTex, surf.texCoord);
}
