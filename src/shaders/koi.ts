export const koiVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  attribute float aBodyPosition; // 0 = head, 1 = tail

  varying vec2 vUv;
  varying float vBodyPos;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vBodyPos = aBodyPosition;
    vNormal = normal;

    vec3 pos = position;

    // Swimming undulation - increases toward tail
    float wave = sin(uTime * uSpeed * 6.0 + aBodyPosition * 4.0) * aBodyPosition * 0.3;
    pos.x += wave * uSize;

    // Slight vertical bob
    pos.y += sin(uTime * uSpeed * 2.0) * 0.02;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const koiFragmentShader = `
  uniform vec3 uBodyColor;
  uniform vec3 uAccentColor;
  uniform float uTime;

  varying vec2 vUv;
  varying float vBodyPos;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Pattern based on UV and body position
    float pattern = smoothstep(0.3, 0.7,
      sin(vUv.x * 6.0 + vBodyPos * 3.0) * 0.5 + 0.5
    );

    // Spots/patches
    float spot1 = smoothstep(0.4, 0.35, length(vUv - vec2(0.3, 0.5)));
    float spot2 = smoothstep(0.3, 0.25, length(vUv - vec2(0.7, 0.4)));

    vec3 color = mix(uBodyColor, uAccentColor, pattern * 0.6 + spot1 * 0.8 + spot2 * 0.6);

    // Subtle iridescence
    float iri = sin(vBodyPos * 10.0 + uTime * 0.5) * 0.05;
    color += vec3(iri, iri * 0.5, -iri);

    // Simple lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diffuse = max(dot(vNormal, lightDir), 0.0);

    // Subsurface scattering approximation
    float sss = max(dot(-vNormal, lightDir), 0.0) * 0.15;

    color *= 0.5 + diffuse * 0.4 + sss;

    // Slight sheen on scales
    float sheen = pow(max(dot(vNormal, normalize(vec3(0.0, 1.0, 0.0))), 0.0), 8.0) * 0.2;
    color += sheen;

    // Darken tail slightly
    color *= 1.0 - vBodyPos * 0.15;

    gl_FragColor = vec4(color, 0.95 - vBodyPos * 0.1);
  }
`;
