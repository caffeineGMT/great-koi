export const waterVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Multi-layered wave displacement
    float wave1 = sin(pos.x * 1.5 + uTime * 0.8) * 0.04;
    float wave2 = cos(pos.z * 1.2 + uTime * 0.6) * 0.035;
    float wave3 = sin((pos.x + pos.z) * 0.8 + uTime * 0.5) * 0.025;
    float wave4 = cos(pos.x * 2.5 - uTime * 1.2) * 0.015;
    float wave5 = sin(pos.z * 3.0 + uTime * 1.5) * 0.01;

    float elevation = wave1 + wave2 + wave3 + wave4 + wave5;
    pos.y += elevation;
    vElevation = elevation;

    // Compute displaced normal for lighting
    float dx = cos(pos.x * 1.5 + uTime * 0.8) * 1.5 * 0.04
             - sin((pos.x + pos.z) * 0.8 + uTime * 0.5) * 0.8 * 0.025
             - sin(pos.x * 2.5 - uTime * 1.2) * 2.5 * 0.015;
    float dz = -sin(pos.z * 1.2 + uTime * 0.6) * 1.2 * 0.035
             + cos((pos.x + pos.z) * 0.8 + uTime * 0.5) * 0.8 * 0.025
             + cos(pos.z * 3.0 + uTime * 1.5) * 3.0 * 0.01;

    vNormal = normalize(vec3(-dx, 1.0, -dz));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepColor;
  uniform vec3 uLightColor;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vElevation;

  // Simplex-like noise for caustics
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float caustics(vec2 uv, float time) {
    float c = 0.0;
    // Layer 1
    c += noise(uv * 8.0 + time * vec2(0.3, 0.2)) * 0.5;
    // Layer 2
    c += noise(uv * 12.0 - time * vec2(0.2, 0.3)) * 0.3;
    // Layer 3
    c += noise(uv * 20.0 + time * vec2(0.1, -0.1)) * 0.2;
    // Sharpen
    c = smoothstep(0.3, 0.7, c);
    return c;
  }

  void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    // Fresnel effect - edges more reflective
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    // Caustic light patterns on the water
    float caustic = caustics(vUv, uTime * 0.3);

    // Depth-based color (center deeper, edges shallower)
    float depth = length(vWorldPosition.xz) * 0.1;
    depth = clamp(depth, 0.0, 1.0);

    // Base water color with depth gradient
    vec3 color = mix(uWaterColor, uDeepColor, depth * 0.5);

    // Add caustic highlights
    color += uLightColor * caustic * 0.15;

    // Add specular highlight
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
    color += uLightColor * spec * 0.4;

    // Add fresnel rim
    color += uLightColor * fresnel * 0.15;

    // Subtle wave-based color variation
    color += uLightColor * vElevation * 2.0;

    // Overall lighting
    color *= 0.7 + diffuse * 0.3;

    float alpha = 0.88 - fresnel * 0.1;

    gl_FragColor = vec4(color, alpha);
  }
`;
